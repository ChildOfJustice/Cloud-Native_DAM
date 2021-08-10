#!/usr/bin/expect -f

cd ../../../

set timeout -1
spawn amplify add hosting
expect "*" ;
send -- "\r" ;
sleep 100
expect "*" ;
send -- "\r" ;
expect eof