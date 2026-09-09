import { MongoClient, Db, GridFSBucket } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import { config } from './config';
import { 
  initialAdmin, 
  initialHomepage, 
  initialAbout, 
  initialSettings, 
  initialSEO, 
  initialNavigation, 
  initialProperties, 
  initialServices, 
  initialTestimonials 
} from './seedData';

let client: MongoClient | null = null;
let db: Db | null = null;
let gridfsBucket: GridFSBucket | null = null;
let memoryServer: MongoMemoryServer | null = null;
let connectPromise: Promise<{ db: Db; bucket: GridFSBucket }> | null = null;

let dbStatus = {
  mode: 'embedded' as 'atlas' | 'embedded',
  database: config.mongodbDatabase,
  connected: false,
};

export function getDatabaseStatus() {
  return dbStatus;
}

export async function connectToDatabase(): Promise<{ db: Db; bucket: GridFSBucket }> {
  if (db && gridfsBucket) {
    return { db, bucket: gridfsBucket };
  }

  if (connectPromise) {
    return connectPromise;
  }

  connectPromise = (async () => {
    const uri = config.mongodbUri;
    const hasValidScheme = uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');

    if (uri && hasValidScheme) {
      try {
        const maskedUri = uri.replace(/:[^:@]+@/, ':****@');
        console.log(`🔌 Attempting connection to MongoDB Atlas cluster: ${maskedUri}...`);
        const externalClient = new MongoClient(uri, {
          serverSelectionTimeoutMS: 6000,
          connectTimeoutMS: 6000,
        });
        await externalClient.connect();
        client = externalClient;
        db = client.db(config.mongodbDatabase);
        dbStatus = {
          mode: 'atlas',
          database: config.mongodbDatabase,
          connected: true,
        };
        console.log(`✅ Successfully connected to external MongoDB Atlas database: ${config.mongodbDatabase}`);
      } catch (externalErr: any) {
        console.log(`⚠️ Remote MongoDB Atlas connection notice: ${externalErr?.message || externalErr}`);
        console.log(`ℹ️ Ensure IP whitelist in Atlas Network Access includes (0.0.0.0/0).`);
        client = null;
        db = null;
      }
    }

    // Fallback to embedded high-performance memory MongoDB if no external DB or if external connection failed
    if (!db) {
      // In serverless environments (e.g. Vercel), external MONGODB_URI is required
      const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
      if (isServerless && (!uri || !hasValidScheme)) {
        throw new Error('MONGODB_URI is required when running on Vercel. Please add your MongoDB Atlas connection string in Vercel Project Settings > Environment Variables.');
      }

      try {
        if (!memoryServer) {
          console.log('🔄 Initializing embedded MongoDB engine...');
          memoryServer = await MongoMemoryServer.create({
            instance: {
              dbName: config.mongodbDatabase,
            },
          });
        }
        const memUri = memoryServer.getUri();
        client = new MongoClient(memUri);
        await client.connect();
        db = client.db(config.mongodbDatabase);
        dbStatus = {
          mode: 'embedded',
          database: config.mongodbDatabase,
          connected: true,
        };
        console.log(`✅ Embedded MongoDB engine ready and connected.`);
      } catch (memErr: any) {
        console.error('Embedded memory MongoDB server failure:', memErr?.message || memErr);
        if (isServerless) {
          throw new Error('Please configure a valid MONGODB_URI in Vercel Environment Variables.');
        }
        throw memErr;
      }
    }

    // Initialize GridFSBucket for binary image storage
    gridfsBucket = new GridFSBucket(db, {
      bucketName: 'mediaFiles',
    });

    console.log('✅ GridFS binary storage bucket initialized.');

    // Create Collections and Indexes
    await setupIndexesAndSeed(db);

    return { db, bucket: gridfsBucket };
  })();

  try {
    return await connectPromise;
  } catch (err) {
    connectPromise = null;
    throw err;
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDatabase first.');
  }
  return db;
}

export function getGridFSBucket(): GridFSBucket {
  if (!gridfsBucket) {
    throw new Error('GridFS Bucket not initialized. Call connectToDatabase first.');
  }
  return gridfsBucket;
}

async function setupIndexesAndSeed(database: Db) {
  try {
    const collections = await database.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // 1. Properties collection & indexes
    const propertiesCol = database.collection('properties');
    await propertiesCol.createIndex({ slug: 1 }, { unique: true });
    await propertiesCol.createIndex({ published: 1 });
    await propertiesCol.createIndex({ featured: 1 });
    await propertiesCol.createIndex({ type: 1 });
    await propertiesCol.createIndex({ status: 1 });
    await propertiesCol.createIndex({ 'location.city': 1 });
    await propertiesCol.createIndex({ price: 1 });
    await propertiesCol.createIndex({ createdAt: -1 });

    // 2. Inquiries collection & indexes
    const inquiriesCol = database.collection('inquiries');
    await inquiriesCol.createIndex({ status: 1 });
    await inquiriesCol.createIndex({ createdAt: -1 });
    await inquiriesCol.createIndex({ propertyId: 1 });

    // 3. Media Metadata collection
    const mediaCol = database.collection('mediaMetadata');
    await mediaCol.createIndex({ fileId: 1 }, { unique: true });
    await mediaCol.createIndex({ category: 1 });
    await mediaCol.createIndex({ uploadDate: -1 });

    // 4. Activity Logs collection
    const activityCol = database.collection('activityLogs');
    await activityCol.createIndex({ timestamp: -1 });

    // 5. Admin users collection
    const adminsCol = database.collection('admins');
    await adminsCol.createIndex({ email: 1 }, { unique: true });

    // Check if initial seeding is needed
    const adminCount = await adminsCol.countDocuments();
    if (adminCount === 0) {
      console.log('🌱 Seeding initial admin user...');
      const hashedPassword = await bcrypt.hash(config.adminInitialPassword, 12);
      await adminsCol.insertOne({
        ...initialAdmin,
        password: hashedPassword,
        pin: config.adminPin,
      });
      console.log(`✅ Default admin created: ${config.adminEmail}`);
    } else {
      // Sync admin avatar to the configured luxury admin profile image
      await adminsCol.updateMany(
        { $or: [{ avatar: { $regex: 'unsplash.com' } }, { avatar: { $regex: '<blockquote' } }, { avatar: { $exists: false } }, { avatar: '' }] },
        { $set: { avatar: initialAdmin.avatar } }
      );
    }

    const propCount = await propertiesCol.countDocuments();
    if (propCount === 0) {
      console.log('🌱 Seeding initial properties...');
      await propertiesCol.insertMany(initialProperties as any);
      console.log(`✅ ${initialProperties.length} initial properties seeded.`);
    }

    const homepageCol = database.collection('homepageContent');
    const homeCount = await homepageCol.countDocuments();
    if (homeCount === 0) {
      await homepageCol.insertOne({ ...initialHomepage, updatedAt: new Date().toISOString() });
    }

    const aboutCol = database.collection('aboutContent');
    const aboutCount = await aboutCol.countDocuments();
    if (aboutCount === 0) {
      await aboutCol.insertOne({ ...initialAbout, updatedAt: new Date().toISOString() });
    }

    const settingsCol = database.collection('websiteSettings');
    const settingsCount = await settingsCol.countDocuments();
    if (settingsCount === 0) {
      await settingsCol.insertOne({ ...initialSettings, updatedAt: new Date().toISOString() });
    }

    const seoCol = database.collection('seoSettings');
    const seoCount = await seoCol.countDocuments();
    if (seoCount === 0) {
      await seoCol.insertOne({ ...initialSEO, updatedAt: new Date().toISOString() });
    }

    const servicesCol = database.collection('services');
    const servicesCount = await servicesCol.countDocuments();
    if (servicesCount === 0) {
      await servicesCol.insertMany(initialServices as any);
    }

    const testimonialsCol = database.collection('testimonials');
    const testCount = await testimonialsCol.countDocuments();
    if (testCount === 0) {
      await testimonialsCol.insertMany(initialTestimonials as any);
    }

    const navCol = database.collection('navigationItems');
    const navCount = await navCol.countDocuments();
    if (navCount === 0) {
      await navCol.insertMany(initialNavigation as any);
    }

    // Initial activity log entry
    const actCount = await activityCol.countDocuments();
    if (actCount === 0) {
      await activityCol.insertOne({
        action: 'System Initialized',
        user: 'System',
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-GB'),
        details: 'Galaxy Real Estate CMS database and GridFS engine initialized successfully.',
      });
    }

    console.log('✅ Database schemas and initial seed records verified.');
  } catch (err) {
    console.error('Error in database setup and seeding:', err);
  }
}
