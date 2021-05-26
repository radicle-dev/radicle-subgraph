import { OrgV1, Anchored, Unanchored } from "../generated/OrgV1Factory/OrgV1";
import { Org, Anchor, Project } from "../generated/schema";
import { Address } from '@graphprotocol/graph-ts'

export function handleAnchored(event: Anchored): void {
  let anchor = new Anchor(event.transaction.hash.toHex());

  anchor.objectId = event.params.id;
  anchor.stateHash = event.params.hash;
  anchor.stateHashFormat = event.params.format;
  anchor.stateType = event.params.kind;
  anchor.org = event.address.toHex();

  anchor.save();

  if (event.params.kind === 0x0) { // Project commit anchor.
    let proj = new Project(event.params.id.toHex());
    proj.org = event.address.toHex();
    proj.stateHash = anchor.stateHash;
    proj.stateHashFormat = anchor.stateHashFormat;
    proj.save();
  }
}

export function handleUnanchored(event: Unanchored): void {}
