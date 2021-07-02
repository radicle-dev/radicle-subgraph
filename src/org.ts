import { OrgV1, Anchored, Unanchored } from "../generated/OrgV1Factory/OrgV1";
import { Org, Anchor, Project } from "../generated/schema";
import { Address, crypto } from "@graphprotocol/graph-ts";
import { concat } from "@graphprotocol/graph-ts/helper-functions";

export function handleAnchored(event: Anchored): void {
  let anchor = new Anchor(event.transaction.hash.toHex());

  anchor.objectId = event.params.id;
  anchor.multihash = event.params.multihash;
  anchor.tag = event.params.tag;
  anchor.org = event.address.toHex();
  anchor.timestamp = event.block.timestamp;

  anchor.save();

  // Project commit anchor.
  if (event.params.tag.isZero()) {
    let proj = new Project(
      // Keyed by Project ID and Org ID because an anchored project can exist
      // in multiple orgs.
      crypto.keccak256(concat(event.params.id, event.address)).toHex()
    );
    proj.org = event.address.toHex();
    proj.anchor = anchor.id;
    proj.save();
  }
}

export function handleUnanchored(event: Unanchored): void {}
