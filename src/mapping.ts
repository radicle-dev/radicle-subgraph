import { BigInt } from "@graphprotocol/graph-ts"
import { OrgV1Factory, OrgCreated } from "../generated/OrgV1Factory/OrgV1Factory"
import { Org } from "../generated/schema"
import { OrgV1 } from '../generated/templates';

export function handleOrgCreated(event: OrgCreated): void {
  let entity = new Org(event.params.org.toHex())

  entity.owner = event.params.safe;
  entity.creator = event.transaction.from;

  // Create the Org data-source.
  OrgV1.create(event.params.org);

  // Write to store.
  entity.save()
}
