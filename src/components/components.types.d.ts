import { SafeAny } from '~/core/types/any';

export interface ComponentPayload<T = SafeAny> {
    cmd: string;
    data?: T;
}
