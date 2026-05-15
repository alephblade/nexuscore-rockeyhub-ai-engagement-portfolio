/**
 * PMO Task Router
 *
 * This is a simplified portfolio-safe module that demonstrates how an
 * operational automation layer could classify events and recommend next actions.
 *
 * It also shows how Telegram can work as the internal operator interface
 * for receiving task updates, alerts and handoff summaries.
 *
 * It does not include production workflows, credentials, private endpoints,
 * real integrations, Telegram bot tokens or proprietary execution logic.
 */

const routingRules = {
  campaign_follow_up_required: {
    priority: "medium",
    owner: "campaign_operations",
    action: "review_follow_up_status",
    dashboardStatus: "follow_up_pending"
  },
  human_handoff_required: {
    priority: "high",
    owner: "human_operator",
    action: "prepare_conversation_summary",
    dashboardStatus: "handoff_pending"
  },
  technical_issue_detected: {
    priority: "medium",
    owner: "technical_operations",
    action: "review_workflow_configuration",
    dashboardStatus: "technical_review_needed"
  },
  decision_log_required: {
    priority: "low",
    owner: "project_operations",
    action: "create_decision_log_entry",
    dashboardStatus: "decision_log_pending"
  }
};

function routeOperationalEvent(event) {
  if (!event || !event.event_type) {
    return {
      status: "error",
      message: "Missing event_type",
      fallback: "manual_review",
      operatorChannel: "telegram"
    };
  }

  const rule = routingRules[event.event_type];

  if (!rule) {
    return {
      status: "unclassified",
      eventType: event.event_type,
      priority: "medium",
      owner: "operations",
      operatorChannel: event.operator_channel || "telegram",
      recommendedAction: "manual_review",
      dashboardStatus: "needs_classification"
    };
  }

  return {
    status: "classified",
    eventType: event.event_type,
    priority: event.priority || rule.priority,
    owner: rule.owner,
    operatorChannel: event.operator_channel || "telegram",
    recommendedAction: rule.action,
    dashboardStatus: rule.dashboardStatus,
    humanHandoffRequired: event.human_handoff_required || false,
    logRequired: event.log_required !== false
  };
}

// Example usage
const sampleEvent = {
  event_type: "human_handoff_required",
  conversation_id: "demo_conversation_042",
  reason: "checkout_question",
  operator_channel: "telegram",
  human_handoff_required: true,
  log_required: true
};

console.log(routeOperationalEvent(sampleEvent));

module.exports = {
  routeOperationalEvent
};
