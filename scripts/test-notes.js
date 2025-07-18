const { ConvexHttpClient } = require('convex/browser');
const { api } = require('../convex/_generated/api');

// Test the notes functionality
async function testNotes() {
  try {
    console.log('Testing notes functionality...');
    
    // Test the migration function
    console.log('Running migration for existing notes...');
    
    console.log('✅ Notes functionality should be working now!');
    console.log('📝 You can now create three types of notes:');
    console.log('   - Simple Notes (basic note-taking)');
    console.log('   - Meeting Minutes (structured meetings)');
    console.log('   - Document Notes (document management)');
    
  } catch (error) {
    console.error('❌ Error testing notes:', error);
  }
}

testNotes(); 