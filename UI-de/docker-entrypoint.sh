#!/bin/bash

npm run build
rm -r /opt/ui/dist
mv /tmp/ui/dist /opt/ui/
cp /tmp/ui/assets/help-center /opt/ui/dist
rm -r /opt/ui/backup
cp -r /opt/ui/dist /opt/ui/backup
chown -R nginx /opt/ui/dist
/usr/bin/supervisord
