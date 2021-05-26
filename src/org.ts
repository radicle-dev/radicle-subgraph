import { OrgV1, Anchored, Unanchored } from "../generated/OrgV1Factory/OrgV1";
import { Org, Anchor } from "../generated/schema";
import { Address } from '@graphprotocol/graph-ts'

export function handleAnchored(event: Anchored): void {
  let anchor = new Anchor(event.transaction.hash.toHex());

  anchor.objectId = event.params.id;
  anchor.stateHash = event.params.hash;
  anchor.stateHashFormat = event.params.format;
  anchor.objectType = event.params.kind;
  anchor.orgAddress = event.address as Address;

  anchor.save();
}

export function handleUnanchored(event: Unanchored): void {}
