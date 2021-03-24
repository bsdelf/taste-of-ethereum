minerAddress=$1
if [ -z $minerAddress ]; then
    printf 'Miner address is required!'
    exit
fi

printf 'Miner address is: %s' $minerAddress

geth --datadir ./chaindata \
    --mine --miner.threads=1 \
    --rpcapi "net,web3,eth" --ws --http --maxpeers=0 \
    --miner.etherbase=$minerAddress
