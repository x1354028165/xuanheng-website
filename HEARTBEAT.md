# HEARTBEAT.md

## 心跳检查规则

每次心跳触发时：
1. 检查是否有 Claude Code session 已完成但未向主人汇报
2. 如有，立即推送完成通知（不回 HEARTBEAT_OK，而是汇报结果）
3. 如无待汇报任务，回复 HEARTBEAT_OK

## 当前待追踪任务
（无）
