#!/bin/bash

cd /tmp
wget "https://raw.githubusercontent.com/mitchellkrogza/Phishing.Database/master/ALL-phishing-domains.tar.gz" -O "ALL-phishing-domains.tar.gz"
tar --overwrite -xf "ALL-phishing-domains.tar.gz"
