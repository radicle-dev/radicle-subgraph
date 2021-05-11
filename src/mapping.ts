import { BigInt } from "@graphprotocol/graph-ts"
import { OrgV1Factory, OrgCreated } from "../generated/OrgV1Factory/OrgV1Factory"
import { OrgV1 } from "../generated/OrgV1Factory/OrgV1"
import { Org } from "../generated/schema"

export function handleOrgCreated(event: OrgCreated): void {
  let entity = new Org(event.params.org.toHex())

  entity.owner = event.params.safe;
  entity.creator = event.transaction.from;

  // Write to store.
  entity.save()
}
