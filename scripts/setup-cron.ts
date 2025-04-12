import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function setupCron() {
  try {
    // Create the cron job command
    // This will run every day at 6 PM (18:00)
    const cronCommand = `0 18 * * * curl -X POST -H "x-cron-secret: ${process.env.CRON_SECRET}" http://localhost:3000/api/batch-update`;

    // For Windows, we'll use Windows Task Scheduler
    if (process.platform === 'win32') {
      const taskName = 'InvestmentPriceUpdate';
      const command = `schtasks /create /tn "${taskName}" /tr "${cronCommand}" /sc daily /st 18:00 /f`;
      await execAsync(command);
      console.log('Windows scheduled task created successfully');
    }
    // For Unix-like systems, we'll use crontab
    else {
      const command = `(crontab -l 2>/dev/null; echo "${cronCommand}") | crontab -`;
      await execAsync(command);
      console.log('Cron job added successfully');
    }
  } catch (error) {
    console.error('Failed to set up cron job:', error);
    process.exit(1);
  }
}

setupCron(); 