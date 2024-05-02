#/bin/sh

# create nginx config from environment
# *prevent envsubst from killing nginx vars with 'tr' and '@'*
cat <<EOT | envsubst | tr '@' '$' >/GH_OAUTH_CLIENT.conf
set @CLIENT_ID $CLIENT_ID;
set @CLIENT_SECRET $CLIENT_SECRET;
EOT

# create config.json with CLIENT_ID
cat /config.json |  jq --arg CLIENT_ID "$CLIENT_ID" --arg date "`date`" '. += { "date": $date } | .repository += { "CLIENT_ID": $CLIENT_ID }' >/app/config.json
