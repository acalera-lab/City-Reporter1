import * as kv from './kv_store.tsx';

// Seed initial data if database is empty
export async function seedDatabase() {
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
