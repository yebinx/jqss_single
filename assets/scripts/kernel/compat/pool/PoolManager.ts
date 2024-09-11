import { instantiate } from "cc";
import { Node, NodePool } from "cc";

class PoolManager {
    poolMap: Map<string, {
        pool: NodePool,
        node: Node
    }> = new Map();

    createPool(name: string, node: Node) {
        let obj = this.poolMap.get(name);
        if (obj) {
            return obj.pool;
        }
        let pool = new NodePool();
        this.poolMap.set(name, {
            pool,
            node: node
        });
        return pool;
    }

    getPool(name: string) {
        return this.poolMap.get(name)?.pool;
    }

    getNode(name: string) {
        let obj = this.poolMap.get(name);
        let node: Node = null;
        if (obj.pool.size() > 0) {
            node = obj.pool.get();
        } else {
            node = instantiate(obj.node);
        }
        return node;
    }

    putNode(name: string, node: Node) {
        let obj = this.poolMap.get(name);
        obj.pool.put(node);
    }

    deletePool(name: string) {
        let obj = this.poolMap.get(name);
        obj.pool.clear();
        obj.node.destroy();
        obj.node = null;
        this.poolMap.delete(name);
    }
}

export let poolManager = new PoolManager();

