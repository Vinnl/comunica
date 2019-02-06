import {ActorRdfMetadataExtract} from "@comunica/bus-rdf-metadata-extract";
import {Bus} from "@comunica/core";
import {Readable} from "stream";
import {ActorRdfMetadataExtractMembership} from "../lib/ActorRdfMetadataExtractMembership";
const stream = require('streamify-array');
const quad = require('rdf-quad');

describe('ActorRdfMetadataExtractMembership', () => {
  let bus;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('The ActorRdfMetadataExtractMembership module', () => {
    it('should be a function', () => {
      expect(ActorRdfMetadataExtractMembership).toBeInstanceOf(Function);
    });

    it('should be a ActorRdfMetadataExtractMembership constructor', () => {
      expect(new (<any> ActorRdfMetadataExtractMembership)({ name: 'actor', bus }))
        .toBeInstanceOf(ActorRdfMetadataExtractMembership);
      expect(new (<any> ActorRdfMetadataExtractMembership)({ name: 'actor', bus }))
        .toBeInstanceOf(ActorRdfMetadataExtract);
    });

    it('should not be able to create new ActorRdfMetadataExtractMembership objects without \'new\'', () => {
      expect(() => { (<any> ActorRdfMetadataExtractMembership)(); }).toThrow();
    });
  });

  describe('An ActorRdfMetadataExtractMembership instance', () => {
    let actor: ActorRdfMetadataExtractMembership;
    let input: Readable;
    let inputNone: Readable;
    let inputLink: Readable;
    let inputLinkProps: Readable;

    beforeEach(() => {
      actor = new ActorRdfMetadataExtractMembership({ name: 'actor', bus });
      input = stream([
        quad('s1', 'p1', 'o1', ''),
        quad('g1', 'py', '12345', ''),
        quad('s2', 'px', '5678', ''),
        quad('s3', 'p3', 'o3', ''),
      ]);
      inputNone = stream([
        quad('s1', 'p1', 'o1', ''),
      ]);
      inputLink = stream([
        quad('http://ex.org/subject', 'http://semweb.mmlab.be/ns/membership#membershipFilter',
          'http://ex.org/filter', ''),
      ]);
      inputLinkProps = stream([
        quad('http://ex.org/subject', 'http://semweb.mmlab.be/ns/membership#membershipFilter',
          'http://ex.org/filter'),
        quad('http://ex.org/filter', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://ex.org/type'),
        quad('http://ex.org/filter', 'http://semweb.mmlab.be/ns/membership#filter', '"abc"'),
        quad('http://ex.org/filter', 'http://semweb.mmlab.be/ns/membership#variable', 'http://ex.org/var'),
        quad('http://ex.org/filter', 'http://semweb.mmlab.be/ns/membership#hashes', '"1"'),
        quad('http://ex.org/filter', 'http://semweb.mmlab.be/ns/membership#bits', '"2"'),
        quad('http://ex.org/filter', 'http://ex.org/otther', '"IGNORED"'),
      ]);
    });

    describe('#detectMembershipProperties', () => {
      it('should detect nothing in an empty stream', async () => {
        const filters = {};
        await actor.detectMembershipProperties(inputNone, filters);
        return expect(filters).toEqual({});
      });

      it('should detect nothing in a stream without membership metadata', async () => {
        const filters = {};
        await actor.detectMembershipProperties(input, filters);
        return expect(filters).toEqual({});
      });

      it('should detect links', async () => {
        const filters = {};
        await actor.detectMembershipProperties(inputLink, filters);
        return expect(filters).toEqual({ 'http://ex.org/filter': { pageIri: 'http://ex.org/subject' } });
      });

      it('should detect links with properties', async () => {
        const filters = {};
        await actor.detectMembershipProperties(inputLinkProps, filters);
        return expect(filters).toEqual({
          'http://ex.org/filter': {
            bits: '2',
            filter: 'abc',
            hashes: '1',
            pageIri: 'http://ex.org/subject',
            type: 'http://ex.org/type',
            variable: 'http://ex.org/var',
          },
        });
      });
    });

    it('should test', () => {
      return expect(actor.test({ pageUrl: '', metadata: input })).resolves.toBeTruthy();
    });

    it('should run', () => {
      return expect(actor.run({ pageUrl: '', metadata: input })).resolves
        .toEqual({ metadata: { membershipFilters: {} }});
    });
  });
});
