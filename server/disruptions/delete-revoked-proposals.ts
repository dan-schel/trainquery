/**
 * When disruptions disappear from the list retrieved from an external API, we
 * need to remove them from our database too. They will be either in the inbox
 * or handled list, depending on whether they had human curation or not.
 * Disruptions that are automatically removed when the sources are revoked
 * should be deleted too if all their sources have now been revoked.
 *
 *
 *
 * I suppose sometimes we might not want a disruption to be automatically
 * deleted without admin approval. It would be nice if the admin dashboard had
 * an area to show disruptions that are pending deletion. Perhaps this could be
 * more generally applicable to anytime a disruption has its sources change, and
 * so the logic in the process new proposal function should also make use of
 * this system when a source hash changes.
 *
 * The admin disruption dashboard could have four sections:
 * "Inbox":
 * - The ProposedDisruption objects that may require human curation.
 * - They have already undergone automatic parsing.
 * "Updated":
 * - The manually created Disruption objects that have had their sources change,
 *   or be removed.
 * - The admin may wish to make edits or delete them.
 * "Curated":
 * - Simply a way for the admin to view all Disruption objects.
 * - Not expected to require any action.
 * - Possibility to filter by automatically created vs human created.
 * "Handled":
 * - The ProposedDisruption objects that are considered "dealt with" because
 *   human curated Disruption objects have been created from them.
 * - Kept around so the hashes can be compared to check for updates.
 * - Not expected to require any action.
 */
export function deleteRevokedProposalDisruptions() {}
