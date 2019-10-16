import {ActorRdfJoin} from "@comunica/bus-rdf-join";
import {Bus} from "@comunica/core";
import {ActorRdfJoinMultiSmallest} from "../lib/ActorRdfJoinMultiSmallest";

describe('ActorRdfJoinMultiSmallest', () => {
  let bus;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('The ActorRdfJoinMultiSmallest module', () => {
    it('should be a function', () => {
      expect(ActorRdfJoinMultiSmallest).toBeInstanceOf(Function);
    });

    it('should be a ActorRdfJoinMultiSmallest constructor', () => {
      expect(new (<any> ActorRdfJoinMultiSmallest)({ name: 'actor', bus })).toBeInstanceOf(ActorRdfJoinMultiSmallest);
      expect(new (<any> ActorRdfJoinMultiSmallest)({ name: 'actor', bus })).toBeInstanceOf(ActorRdfJoin);
    });

    it('should not be able to create new ActorRdfJoinMultiSmallest objects without \'new\'', () => {
      expect(() => { (<any> ActorRdfJoinMultiSmallest)(); }).toThrow();
    });
  });

  describe('An ActorRdfJoinMultiSmallest instance', () => {
    let actor: ActorRdfJoinMultiSmallest;

    beforeEach(() => {
      actor = new ActorRdfJoinMultiSmallest({ name: 'actor', bus });
    });

    it('should test', () => {
      return expect(actor.test({ todo: true })).resolves.toEqual({ todo: true }); // TODO
    });

    it('should run', () => {
      return expect(actor.run({ todo: true })).resolves.toMatchObject({ todo: true }); // TODO
    });
  });
});
