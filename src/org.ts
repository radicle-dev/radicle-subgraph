import { Anchored, Unanchored, OwnerChanged } from "../generated/OrgV1Factory/OrgV1";
import { Org, Anchor, Project, Safe } from "../generated/schema";
import { store, crypto, Bytes } from "@graphprotocol/graph-ts";
import { GnosisSafe as GnosisSafeContract } from '../generated/templates';
import { concat } from "@graphprotocol/graph-ts/helper-functions";
import { GnosisSafe } from "../generated/templates/GnosisSafe/GnosisSafe";

export function handleAnchored(event: Anchored): void {
  let anchor = new Anchor(event.transaction.hash.toHex());

  anchor.objectId = event.params.id;
  anchor.multihash = event.params.multihash;
  anchor.tag = event.params.tag;
  anchor.org = event.address.toHex();
  anchor.timestamp = event.block.timestamp;
  anchor.blockNumber = event.block.number;
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
    proj.timestamp = anchor.timestamp;
    proj.save();
  }
}

export function handleUnanchored(event: Unanchored): void {
  store.remove('Project', 
    crypto.keccak256(concat(event.params.id, event.address)).toHex()
  );

  // Note that we are keeping all anchors as historical events.
}

export function handleOwnerChanged(event: OwnerChanged): void {
  // Load Org and if not available or same owner, return early
  let org = Org.load(event.address.toHex());
  if (org === null || org.owner === event.params.newOwner) {
    return;
  }

  // Try to load Safe, if found remove it from storage.
  let currentSafe = Safe.load(org.owner.toHex());
  if (currentSafe !== null) {
    org.safe = null;
    store.remove("Safe", org.owner.toHex());
  }

  // Check if it's a safe and if so create it.
  let safeInstance = GnosisSafe.bind(event.params.newOwner);
  let callGetOwnerResult = safeInstance.try_getOwners();
  if (!callGetOwnerResult.reverted) {
    let safe = new Safe(event.params.newOwner.toHex());
    //@ts-expect-error The function changetype gets injected by the graph-cli
    safe.owners = changetype<Bytes[]>(callGetOwnerResult.value);
    safe.threshold = safeInstance.getThreshold();
    org.safe = event.params.newOwner.toHex();

    GnosisSafeContract.create(event.params.newOwner);
    safe.save();
  }

  org.owner = event.params.newOwner;
  org.save();
}


