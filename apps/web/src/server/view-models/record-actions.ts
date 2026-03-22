import type { GenericRecordRow } from "@openpolis/application";

import type { RecordActionItem } from "@/components/modules/record-action-card";

import {
  createModuleQueryHref,
  getRecordTitle,
  type CoreRouteModuleId,
  recordCollectionMap,
  type ServerTranslations
} from "./shared";

export function createRecordActionItems(
  locale: string,
  moduleId: CoreRouteModuleId,
  row: GenericRecordRow,
  tRecords: ServerTranslations,
  tActions: ServerTranslations
) {
  const actions: RecordActionItem[] = [];
  const collection = recordCollectionMap[moduleId];
  const recordTitle = getRecordTitle(collection, row.code, row.title, tRecords);

  switch (moduleId) {
    case "issues":
      actions.push({
        label: tActions("createBrief"),
        href: createModuleQueryHref(locale, "briefs", {
          issueCode: row.code,
          title: tActions("templates.briefFromIssue.title", {
            title: recordTitle
          }),
          summary: tActions("templates.briefFromIssue.summary", {
            title: recordTitle
          })
        })
      });
      actions.push({
        label: tActions("createAssetDraft"),
        href: createModuleQueryHref(locale, "assets", {
          issueCode: row.code,
          title: tActions("templates.assetFromIssue.title", {
            title: recordTitle
          }),
          summary: tActions("templates.assetFromIssue.summary", {
            title: recordTitle
          })
        })
      });
      actions.push({
        label: tActions("createTask"),
        href: createModuleQueryHref(locale, "operations", {
          issueCode: row.code,
          title: tActions("templates.taskFromIssue.title", {
            title: recordTitle
          }),
          summary: tActions("templates.taskFromIssue.summary", {
            title: recordTitle
          })
        })
      });
      break;
    case "briefs":
      actions.push({
        label: tActions("createAssetDraft"),
        href: createModuleQueryHref(locale, "assets", {
          issueCode: row.issueCode ?? undefined,
          briefCode: row.code,
          title: tActions("templates.assetFromBrief.title", {
            title: recordTitle
          }),
          summary: tActions("templates.assetFromBrief.summary", {
            title: recordTitle
          })
        })
      });
      actions.push({
        label: tActions("createTask"),
        href: createModuleQueryHref(locale, "operations", {
          issueCode: row.issueCode ?? undefined,
          briefCode: row.code,
          title: tActions("templates.taskFromBrief.title", {
            title: recordTitle
          }),
          summary: tActions("templates.taskFromBrief.summary", {
            title: recordTitle
          })
        })
      });
      break;
    case "assets":
      actions.push({
        label: tActions("submitReview"),
        href: createModuleQueryHref(locale, "review", {
          assetCode: row.code,
          title: tActions("templates.reviewFromAsset.title", {
            title: recordTitle
          })
        })
      });
      break;
    case "operations":
      actions.push({
        label: tActions("captureFeedback"),
        href: createModuleQueryHref(locale, "feedback", {
          issueCode: row.issueCode ?? undefined,
          taskCode: row.code,
          title: tActions("templates.feedbackFromTask.title", {
            title: recordTitle
          }),
          summary: tActions("templates.feedbackFromTask.summary", {
            title: recordTitle
          })
        })
      });
      break;
    case "review":
      actions.push({
        label: tActions("recordDecision"),
        href: createModuleQueryHref(locale, "review", {
          approvalCode: row.code
        })
      });
      break;
    default:
      break;
  }

  return actions;
}
