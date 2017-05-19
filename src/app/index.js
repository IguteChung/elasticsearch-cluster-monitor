import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class App extends Component {

  buildIndexItems(index) {
    const { nodes, metadata, routing_table } = this.props;
    let items = [];
    for (var i = 0; i < metadata.indices[index].settings.index.number_of_shards; i++) {
      routing_table.indices[index].shards[i].forEach((shard, key) => {
        const name = shard.node ? nodes[shard.node].name : 'N/A';
        const className = shard.state === 'STARTED' ? 'ok' : 'warn';
        items.push(<p key={`${i}${key}`} className={className}>{`shard[${i}][${key}] on ${name}: ${shard.state}`}</p>);
      });
    }
    return items;
  }

  buildNodeItems(nodeId) {
    const { routing_table, routing_nodes } = this.props;
    let items = [];
    routing_nodes.nodes[nodeId].forEach(node => {
      Object.keys(routing_table.indices[node.index].shards).forEach(key => {
        routing_table.indices[node.index].shards[`${key}`].forEach((shard, keyReplica) => {
          if (shard.allocation_id && shard.allocation_id.id === node.allocation_id.id) {
            const className = node.state === 'STARTED' ? 'ok' : 'warn';
            items.push(<p key={`${nodeId}${node.allocation_id.id}`} className={className}>{`${node.index}[${node.shard}][${keyReplica}]: ${node.state}`}</p>);
          }
        });
      });
    });
    return items;
  }

  render() {
    const clusterName = this.props.cluster_name;
    const {
      version, nodes, metadata, routing_nodes
    } = this.props;
    return (
      <div>
        <h1>Cluster: {clusterName}</h1>
        <h2>Version: {version}</h2>
        <h2>Indices: </h2>
        <table>
          <thead>
          <tr>
            <th>Index</th>
            <th>#Shards</th>
            <th>#Replicas</th>
            <th>Routing</th>
          </tr>
          </thead>
          <tbody>
          {
            Object.keys(metadata.indices).map(index => (
              <tr key={index}>
                <td>{index}</td>
                <td>{metadata.indices[index].settings.index.number_of_shards}</td>
                <td>{metadata.indices[index].settings.index.number_of_replicas}</td>
                <td>{ this.buildIndexItems(index) }</td>
              </tr>
            ))
          }
          </tbody>
        </table>
        <h2>Nodes: </h2>
        <table>
          <thead>
          <tr>
            <th>Node</th>
            <th>Routing</th>
          </tr>
          </thead>
          <tbody>
          {
            Object.keys(routing_nodes.nodes).map(nodeId => (
              <tr key={nodeId}>
                <td>{nodes[nodeId].name}</td>
                <td>{ this.buildNodeItems(nodeId) }</td>
              </tr>
            ))
          }
          </tbody>
        </table>
      </div>
    );
  }
}

App.propTypes = {
  cluster_name: PropTypes.string.isRequired,
  version: PropTypes.number.isRequired,
  master_node: PropTypes.string.isRequired,
  nodes: PropTypes.object.isRequired,
  metadata: PropTypes.object.isRequired,
  routing_table: PropTypes.object.isRequired,
  routing_nodes: PropTypes.object.isRequired
};
