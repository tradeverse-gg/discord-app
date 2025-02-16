export enum PingAction {
	Refresh,
}

export interface PingButtonProps {
	action: PingAction;
	updatedAt: Date | number;
}
