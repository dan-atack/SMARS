#!/bin/bash
# Add job to cron table to run at one minute after midnight (h=4 so long as we're on UST) every night
cd ~/smars && echo "1 4 * * * sudo bash ~/smars/scripts/backupDatabase.sh >> ~/logs/cronjob.log 2>&1" | crontab -
# Add another cron job to schedule hourly updates to the docker log file, without overwriting the previous job/s
cd ~/smars && (crontab -l ; echo "0 * * * * sudo bash ~/smars/scripts/updateContainerLogs.sh  >> ~/logs/cronjob.log 2>&1") | crontab -
