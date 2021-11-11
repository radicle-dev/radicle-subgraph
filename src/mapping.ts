import { OrgCreated } from "../generated/OrgV1Factory/OrgV1Factory";
import { Org, Safe } from "../generated/schema";
import { GnosisSafe } from "../generated/templates/GnosisSafe/GnosisSafe";
import { GnosisSafe as GnosisSafeContract, OrgV1 } from '../generated/templates';
import { Bytes } from "@graphprotocol/graph-ts";

export function handleOrgCreated(event: OrgCreated): void {
  let org = new Org(event.params.org.toHex());
  
  // Check if owner is a Safe and if create a new Safe entity
  let safeInstance = GnosisSafe.bind(event.params.safe);
  let callGetOwnerResult = safeInstance.try_getOwners();
  if (!callGetOwnerResult.reverted) {
    let safe = new Safe(event.params.safe.toHex());
    //@ts-expect-error The function changetype gets injected by the graph-cli
    safe.owners = changetype<Bytes[]>(callGetOwnerResult.value);
    safe.threshold = safeInstance.getThreshold();
    org.safe = event.params.safe.toHex();

    GnosisSafeContract.create(event.params.safe);
    safe.save();
  }

  org.owner = event.params.safe;
  org.creator = event.transaction.from;
  org.timestamp = event.block.timestamp;

  OrgV1.create(event.params.org);
  org.save()
}
