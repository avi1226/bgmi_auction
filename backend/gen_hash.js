const bcrypt = require('bcryptjs');

async function generate() {
    const adminPass = await bcrypt.hash('admin123', 10);
    const teamPass = await bcrypt.hash('team123', 10);
    const playerPass = await bcrypt.hash('player123', 10);
    
    console.log('Admin Hash:', adminPass);
    console.log('Team Hash:', teamPass);
    console.log('Player Hash:', playerPass);
}

generate();
