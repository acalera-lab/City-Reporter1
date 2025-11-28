import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Initialize storage bucket
async function initStorage() {
  const bucketName = 'make-6fd663d5-reports';
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
  
  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: false,
      fileSizeLimit: 5242880, // 5MB
    });
    if (error) {
      console.log('Error creating bucket:', error);
    } else {
      console.log('Storage bucket created successfully');
    }
  }
}

initStorage();

// Initialize admin user
async function initAdminUser() {
  const adminEmail = 'sahor@gmail.com';
  const adminPassword = 'ludwig123';
  
  try {
    // Check if admin user exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const adminExists = existingUser?.users?.some(user => user.email === adminEmail);
    
    if (!adminExists) {
      // Create admin user
      const { data, error } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true, // Automatically confirm the user's email since an email server hasn't been configured
        user_metadata: {
          role: 'admin',
          name: 'Admin User'
        }
      });
      
      if (error) {
        console.log('Error creating admin user:', error);
      } else {
        console.log('Admin user created successfully');
      }
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.log('Error initializing admin user:', error);
  }
}

initAdminUser();

// Seed database with initial data
async function seedDatabase() {
  try {
    const existingReports = await kv.getByPrefix('report:');
    
    // Only seed if there are no reports
    if (existingReports.length === 0) {
      console.log('Database is empty. Seeding initial data...');
      
      const sampleReports = [
        {
          id: '1732611600000',
          title: 'Pothole on Main Street',
          description: 'Large pothole causing traffic issues near the intersection with Oak Avenue. Needs immediate attention.',
          type: 'infrastructure',
          location: 'Main Street & Oak Avenue',
          imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80',
          status: 'in-progress',
          timestamp: 1732611600000,
        },
        {
          id: '1732698000000',
          title: 'Broken Street Light',
          description: 'Street light has been out for a week, making the area unsafe at night.',
          type: 'safety',
          location: 'Park Avenue, Block 200',
          imageUrl: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=800&q=80',
          status: 'pending',
          timestamp: 1732698000000,
        },
        {
          id: '1732179600000',
          title: 'Illegal Dumping',
          description: 'Construction debris dumped in the park area. Environmental hazard.',
          type: 'environment',
          location: 'Central Park, East Side',
          imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80',
          status: 'resolved',
          timestamp: 1732179600000,
        },
        {
          id: '1732352400000',
          title: 'Traffic Signal Malfunction',
          description: 'Traffic light stuck on red in all directions causing congestion.',
          type: 'traffic',
          location: 'Highway 101 & 5th Street',
          imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',
          status: 'in-progress',
          timestamp: 1732352400000,
        },
        {
          id: '1732784400000',
          title: 'Overflowing Trash Bins',
          description: 'Public trash bins have not been emptied in several days.',
          type: 'public-services',
          location: 'Downtown Shopping District',
          imageUrl: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=800&q=80',
          status: 'pending',
          timestamp: 1732784400000,
        },
      ];

      // Save all sample reports
      const promises = sampleReports.map(report => 
        kv.set(`report:${report.id}`, report)
      );
      
      await Promise.all(promises);
      console.log(`Seeded ${sampleReports.length} sample reports successfully`);
    } else {
      console.log(`Database already has ${existingReports.length} reports. Skipping seed.`);
    }
  } catch (error) {
    console.log('Error seeding database:', error);
  }
}

seedDatabase();

// Middleware to check if user is authenticated admin
const requireAdmin = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
    return c.json({ success: false, error: 'Unauthorized - Admin access required' }, 401);
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    return c.json({ success: false, error: 'Invalid authentication token' }, 401);
  }
  
  c.set('user', user);
  await next();
};

// Login endpoint
app.post('/make-server-6fd663d5/auth/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return c.json({ success: false, error: 'Email and password are required' }, 400);
    }
    
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );
    
    const { data, error } = await authClient.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.log('Login error:', error);
      return c.json({ success: false, error: 'Invalid email or password' }, 401);
    }
    
    // Check if user is admin
    if (data.user?.user_metadata?.role !== 'admin') {
      return c.json({ success: false, error: 'Access denied - Admin privileges required' }, 403);
    }
    
    return c.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role,
        name: data.user.user_metadata?.name
      },
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
      }
    });
  } catch (error) {
    console.log('Error in login endpoint:', error);
    return c.json({ success: false, error: 'Login failed' }, 500);
  }
});

// Verify token endpoint
app.get('/make-server-6fd663d5/auth/verify', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: 'No token provided' }, 401);
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ success: false, error: 'Invalid token' }, 401);
    }
    
    return c.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role,
        name: user.user_metadata?.name
      }
    });
  } catch (error) {
    console.log('Error verifying token:', error);
    return c.json({ success: false, error: 'Token verification failed' }, 500);
  }
});

// Logout endpoint
app.post('/make-server-6fd663d5/auth/logout', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: true, message: 'Already logged out' });
    }
    
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );
    
    await authClient.auth.signOut();
    
    return c.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.log('Error in logout endpoint:', error);
    return c.json({ success: false, error: 'Logout failed' }, 500);
  }
});

// Get all reports
app.get('/make-server-6fd663d5/reports', async (c) => {
  try {
    console.log('Fetching all reports...');
    const reports = await kv.getByPrefix('report:');
    console.log('Raw reports from KV:', reports);
    
    // Handle empty case
    if (!reports || reports.length === 0) {
      console.log('No reports found');
      return c.json({ success: true, reports: [] });
    }
    
    // Extract values and sort
    const reportValues = reports.map(r => r.value || r);
    const sortedReports = reportValues.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    console.log('Returning sorted reports:', sortedReports.length);
    return c.json({ success: true, reports: sortedReports });
  } catch (error) {
    console.log('Error fetching reports:', error);
    return c.json({ success: false, error: `Failed to fetch reports: ${error.message}` }, 500);
  }
});

// Get single report
app.get('/make-server-6fd663d5/reports/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const report = await kv.get(`report:${id}`);
    
    if (!report) {
      return c.json({ success: false, error: 'Report not found' }, 404);
    }
    
    return c.json({ success: true, report });
  } catch (error) {
    console.log('Error fetching report:', error);
    return c.json({ success: false, error: 'Failed to fetch report' }, 500);
  }
});

// Create new report
app.post('/make-server-6fd663d5/reports', async (c) => {
  try {
    const body = await c.req.json();
    const { title, description, type, location, imageUrl } = body;
    
    if (!title || !description || !type || !location) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }
    
    const id = Date.now().toString();
    const report = {
      id,
      title,
      description,
      type,
      location,
      imageUrl: imageUrl || null,
      status: 'pending',
      timestamp: Date.now(),
    };
    
    await kv.set(`report:${id}`, report);
    
    return c.json({ success: true, report });
  } catch (error) {
    console.log('Error creating report:', error);
    return c.json({ success: false, error: 'Failed to create report' }, 500);
  }
});

// Update report status (admin only)
app.patch('/make-server-6fd663d5/reports/:id/status', requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { status } = body;
    
    console.log('Updating report status:', { id, status });
    
    if (!status || !['pending', 'in-progress', 'resolved'].includes(status)) {
      return c.json({ success: false, error: 'Invalid status' }, 400);
    }
    
    const report = await kv.get(`report:${id}`);
    
    console.log('Found report:', report);
    
    if (!report) {
      return c.json({ success: false, error: 'Report not found' }, 404);
    }
    
    const updatedReport = { ...report, status };
    await kv.set(`report:${id}`, updatedReport);
    
    console.log('Updated report:', updatedReport);
    
    return c.json({ success: true, report: updatedReport });
  } catch (error) {
    console.log('Error updating report status:', error);
    return c.json({ success: false, error: 'Failed to update report status' }, 500);
  }
});

// Upload image
app.post('/make-server-6fd663d5/upload', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body.file as File;
    
    if (!file) {
      return c.json({ success: false, error: 'No file provided' }, 400);
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }, 400);
    }
    
    // Validate file size (5MB max)
    if (file.size > 5242880) {
      return c.json({ success: false, error: 'File size exceeds 5MB limit' }, 400);
    }
    
    const bucketName = 'make-6fd663d5-reports';
    const fileName = `${Date.now()}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();
    
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
      });
    
    if (uploadError) {
      console.log('Error uploading file:', uploadError);
      return c.json({ success: false, error: 'Failed to upload file' }, 500);
    }
    
    // Generate signed URL (valid for 1 year)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000);
    
    if (signedUrlError) {
      console.log('Error creating signed URL:', signedUrlError);
      return c.json({ success: false, error: 'Failed to create signed URL' }, 500);
    }
    
    return c.json({ success: true, imageUrl: signedUrlData.signedUrl });
  } catch (error) {
    console.log('Error in upload endpoint:', error);
    return c.json({ success: false, error: 'Failed to process upload' }, 500);
  }
});

// Delete report (admin only)
app.delete('/make-server-6fd663d5/reports/:id', requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const report = await kv.get(`report:${id}`);
    
    if (!report) {
      return c.json({ success: false, error: 'Report not found' }, 404);
    }
    
    await kv.del(`report:${id}`);
    
    return c.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    console.log('Error deleting report:', error);
    return c.json({ success: false, error: 'Failed to delete report' }, 500);
  }
});

// Health check endpoint
app.get('/make-server-6fd663d5/health', async (c) => {
  try {
    // Test database connection
    const reports = await kv.getByPrefix('report:');
    
    // Test storage bucket
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'make-6fd663d5-reports');
    
    return c.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        storage: bucketExists ? 'ready' : 'bucket missing',
        auth: 'ready',
        reports_count: reports.length
      }
    });
  } catch (error) {
    console.log('Health check error:', error);
    return c.json({
      success: false,
      status: 'unhealthy',
      error: error.message
    }, 500);
  }
});

Deno.serve(app.fetch);