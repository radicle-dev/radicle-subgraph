import { AddedOwner, RemovedOwner, ChangedThreshold } from "../generated/templates/GnosisSafe/GnosisSafe";
import { Safe } from '../generated/schema';

export function handleAddedOwner(event: AddedOwner): void {
  let safe = Safe.load(event.address.toHex());

  if (safe !== null) {
    let owners = safe.owners;
    owners.push(event.params.owner);
    safe.owners = owners;
    safe.save();
  }
}

export function handleRemovedOwner(event: RemovedOwner): void {
  let safe = Safe.load(event.address.toHex());

  if (safe !== null) {
    let owners = safe.owners;
    let index = owners.indexOf(event.params.owner, 0);
    if (index > -1) {
      owners.splice(index, 1);
    }
    safe.owners = owners;
    safe.save();
  }
}

export function handleChangedThreshold(event: ChangedThreshold): void {
  let safe = Safe.load(event.address.toHex());

  if (safe !== null) {
    safe.threshold = event.params.threshold;
    safe.save();
  }
}
