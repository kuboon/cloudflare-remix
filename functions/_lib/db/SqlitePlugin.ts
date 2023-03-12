import { KyselyPlugin, OperationNodeTransformer } from 'kysely'
import type { PluginTransformQueryArgs, RootOperationNode, PluginTransformResultArgs, QueryResult, UnknownRow, ValueNode } from 'kysely'

export class SqlitePlugin implements KyselyPlugin {
  readonly #transformer = new SqliteBooleanTransformer()

  transformQuery(args: PluginTransformQueryArgs): RootOperationNode {
    return this.#transformer.transformNode(args.node)
  }

  transformResult(
    args: PluginTransformResultArgs
  ): Promise<QueryResult<UnknownRow>> {
    return Promise.resolve(args.result)
  }
}

class SqliteBooleanTransformer extends OperationNodeTransformer {
  transformValue(node: ValueNode): ValueNode {
    const value =
      typeof node.value === 'boolean' ? (node.value ? 1 : 0) :
        node.value instanceof Date ? (node.value.toISOString()) :
          node.value
    const ret = { ...super.transformValue(node), value }
    return ret
  }
}
