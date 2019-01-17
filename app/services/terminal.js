const blessed = require('blessed');
const contrib = require('blessed-contrib');
const objectHash = require('object-hash');
const _ = require('lodash');
const util = require('util');

let screen = blessed.screen();
let log, nodesTable, chainTable, selectedNode, statusBox, balanceChart, txTable;

exports.InitalizeLayout = () => {
    // set up screen
    let grid = new contrib.grid({ rows: 4, cols: 5, screen });
    // rolling log
    log = grid.set(0, 0, 3, 3, contrib.log, { label: 'Verbose Log', fg: "green" });

    // table for selectable nodes - which to follow
    nodesTable = grid.set(0, 3, 1, 2, contrib.table, {
        label: 'Nodes (navigate w/ arrow keys - select w/ "Enter")',
        columnWidth: [10, 16, 10],
        columnSpacing: 5,
        interactive: true,
        keys: true 
    });
    nodesTable.setData({ headers: ['Node', 'Blocks Mined', 'Chain Hash'], data: [] });
    nodesTable.rows.on('select', (item, index) => {
        setSelectedNode(index);
    })
    nodesTable.focus();

    // table to show current chain data for selected node
    chainTable = grid.set(1, 3, 1, 1, contrib.table, {
        label: 'Current Chain',
        columnWidth: [10, 20],
        columnSpacing: 5
    })
    chainTable.setData({ headers: ['Block', 'Hash'], data: []});

    statusBox = grid.set(1, 4, 1, 1, contrib.donut, {
        label: 'Status',
        radius: 8,
        arcWidth: 3,
        remainColor: 'black',
        yPadding: 0,
        data: [
            { percent: 100, label: "CONSENSUS", color: "green" }
        ]
    });

    balanceChart = grid.set(3, 0, 1, 5, contrib.bar, {
        label: 'Address / Account Balances',
        barWidth: 11,
        barSpacing: 17,
        maxHeight: 50,
        height: "50%"
    });

    txTable = grid.set(2, 3, 1, 2, contrib.table, {
        label: 'Tx (According to selected node - only looks 1 block backwards)',
        columnWidth: [15, 15, 10],
        columnSpacing: 5,
        interactive: true,
        keys: true 
    });
    txTable.setData({ headers: ['From', 'To', 'Status'], data: [] });

    screen.append(balanceChart);
    balanceChart.setData({
        titles: [],
        data: []
    });

    // make sure we can still escape
    screen.key(['escape', 'q', 'C-c'], () => {
        return process.exit(0);
    });

    screen.render();

    // set up automatic updating
    setInterval(() => {
        checkNodeIsSet();
        updateNodesTableData();
        updateCurrentChainTable();
        updateStatusBlock();
        updateBalanceChart();
        updateTxTable();
        screen.render();
    }, 250);
}

exports.verboseLog = (message) => {
    if (_.isString(message)) log.log(message);
    else if (_.isNumber(message)) log.log(message.toString());
    else log.log("** suppressed log message ** ('npm run debug' to show all messages)");
}

var checkNodeIsSet = () => {
    if (!selectedNode && typeof NODE_MAP !== 'undefined') {
        selectedNode = NODE_MAP[Object.keys(NODE_MAP)[0]];
    }
}

var updateNodesTableData = () => {
    let data = [];
    for (const [id, node] of Object.entries(NODE_MAP)) {
        data.push([node.displayName, node.candidateBlocksMined, objectHash(node.chain).substring(0,5).concat('...')]);
    }
    nodesTable.setData({ headers:['Node', 'Blocks Mined', 'Chain Hash'], data });
}

var updateCurrentChainTable = () => {
    let data = [];
    for (const [num, block] of Object.entries(selectedNode.chain)) {
        data.unshift([num, block.headerHash.substring(0,10).concat('...')]);
        if (data.length > 5) data.pop();
    }
    chainTable.setData({ headers: ['Block', 'Hash'], data });
}

var updateStatusBlock = () => {
    let consensusCount = 0;
    let fork = false;
    Object.values(NODE_MAP).map((node) => {
        if (node.id == selectedNode.id) return;
        if (objectHash(node.chain) == objectHash(selectedNode.chain)) consensusCount++;
        // no need to check for a fork if one is already found at a previous node
        if (fork || Object.values(node.chain).some((block) => {
            return selectedNode.chain[block.number] && (block.headerHash != selectedNode.chain[block.number].headerHash)
        })) {
            fork = true;
        }
    });

    statusBox.setData([{
        percent: Math.round(consensusCount / (NUM_NODES - 1) * 1000) / 10,
        label: fork ? 'FORK' : 'CONSENSUS',
        color: fork ? 'red' : 'green' 
    }]);
}

var updateBalanceChart = () => {

    let data = { titles: [], data: [] };
    for (const account of Object.values(ACCOUNT_MAP)) {
        data.titles.push(account.displayName);
        data.data.push(account.balance);
    }
    balanceChart.setData(data);
}

var updateTxTable = () => {
    let data = Object.values(selectedNode.unminedTxMap)
        .sort((tx, tx2) => { return tx2.timestamp - tx.timestamp }).map((tx) => {
            return [ ACCOUNT_MAP[tx.from].displayName, ACCOUNT_MAP[tx.to].displayName, 'verified'];
    });

    // we'll look at the latest block on the chain for mined tx to show in this table - it's tiny anyways
    latestBlockNum = Object.keys(selectedNode.chain).length - 1;
    if (selectedNode.chain[latestBlockNum]) {
        let mined = Object.values(selectedNode.chain[latestBlockNum].transactions)
            .sort((tx, tx2) => { return tx2.timestamp - tx.timestamp }).map((tx) => {
                return [ ACCOUNT_MAP[tx.from].displayName, ACCOUNT_MAP[tx.to].displayName, '* mined *'];
            });

        data = data.concat(mined);
    };
    
    txTable.setData({ headers: ['From', 'To', 'Status'], data });
}

var setSelectedNode = (index) => {
    selectedNode = NODE_MAP[Object.keys(NODE_MAP)[index]];
    CONSOLE_LOG(`Set selected node to ${selectedNode.displayName}`);
}