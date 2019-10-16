import {IActorQueryOperationOutput, IActorQueryOperationOutputBindings} from "@comunica/bus-query-operation";
import {ActorRdfJoin, IActionRdfJoin} from "@comunica/bus-rdf-join";
import {IActorArgs, IActorTest, Mediator} from "@comunica/core";
import {IMediatorTypeIterations} from "@comunica/mediatortype-iterations";

/**
 * A comunica Multi Smallest RDF Join Actor.
 */
export class ActorRdfJoinMultiSmallest extends ActorRdfJoin {

  public readonly mediatorJoin: Mediator<ActorRdfJoin,
    IActionRdfJoin, IMediatorTypeIterations, IActorQueryOperationOutput>;

  constructor(args: IActorRdfJoinMultiSmallestArgs) {
    super(args, 3, true);
  }

  public static getSmallestPatternId(totalItems: number[]) {
    let smallestId: number = -1;
    let smallestCount: number = Infinity;
    for (let i = 0; i < totalItems.length; i++) {
      const count: number = totalItems[i];
      if (count <= smallestCount) {
        smallestCount = count;
        smallestId = i;
      }
    }
    return smallestId;
  }

  protected async getOutput(action: IActionRdfJoin): Promise<IActorQueryOperationOutputBindings> {
    const entries: IActorQueryOperationOutputBindings[] = action.entries.slice();

    // Determine the two smallest streams by estimated count
    const entriesTotalItems = (await Promise.all(action.entries.map((entry) => entry.metadata())))
      .map((metadata) => 'totalItems' in metadata ? metadata.totalItems : Infinity);
    console.log(entriesTotalItems); // TODO
    const smallestIndex1: number = ActorRdfJoinMultiSmallest.getSmallestPatternId(entriesTotalItems);
    const smallestItem1 = entries.splice(smallestIndex1, 1)[0];
    const smallestCount1 = entriesTotalItems.splice(smallestIndex1, 1);
    const smallestIndex2: number = ActorRdfJoinMultiSmallest.getSmallestPatternId(entriesTotalItems);
    const smallestItem2 = entries.splice(smallestIndex2, 1)[0];
    const smallestCount2 = entriesTotalItems.splice(smallestIndex2, 1);

    console.log('SMALLEST 1 ' + smallestCount1); // TODO
    console.log('SMALLEST 2 ' + smallestCount2); // TODO

    const firstEntry: IActorQueryOperationOutputBindings = <IActorQueryOperationOutputBindings> await
      this.mediatorJoin.mediate({ entries: [ smallestItem1, smallestItem2 ] });
    entries.unshift(firstEntry);
    return <IActorQueryOperationOutputBindings> await this.mediatorJoin.mediate({ entries });
  }

  protected async getIterations(action: IActionRdfJoin): Promise<number> {
    return (await Promise.all(action.entries.map((entry) => entry.metadata())))
      .reduce((acc, value) => acc * value.totalItems, 1);
  }

}

export interface IActorRdfJoinMultiSmallestArgs
  extends IActorArgs<IActionRdfJoin, IActorTest, IActorQueryOperationOutput> {
  mediatorJoin: Mediator<ActorRdfJoin,
    IActionRdfJoin, IMediatorTypeIterations, IActorQueryOperationOutput>;
}
