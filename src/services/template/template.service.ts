import { Injectable, Logger } from '@nestjs/common';
import * as ejs from 'ejs';
import { Err, Ok, Result } from 'oxide.ts';
import { Observable } from 'rxjs';

import { AbstractDefaultService } from '@/core/abstract/service/default.service.abstract';

/**
 * @description This service is used to create HTML templates using EJS (Embedded JavaScript).
 * @see [EJS Documentation](https://ejs.co/#docs)
 * @security
 * When rendering content, if a variable can be edited by the user, it is important to sanitize the content to prevent XSS attacks.
 * It can be done using the `<%=` tag in EJS, which will escape the content.
 */
@Injectable()
export class TemplateService extends AbstractDefaultService {
    public enabled: boolean;
    public readonly rootPath: string = `${__dirname}/static`;
    constructor() {
        super('TemplateService');
    }

    /**
     * @description
     * This method is used to render an HTML template using EJS.
     *
     * @param {string} filename - Will pick up the file automatically in `src/services/template/static/${filename}.ejs`.
     * @param {Record<string, any>} data - The data to be used in the template.
     *
     * @returns {string} The rendered HTML template.
     */
    public render<T extends Record<string, any>>(filename: string, data: T): Observable<Result<string, string>> {
        const options: ejs.Options = {
            cache: false,
            filename: filename,
            root: this.rootPath,
        };
        const path: string = `${this.rootPath}/${filename}.ejs`;
        const renderedData = {
            ...data,
            filename: filename,
            rootPath: this.rootPath,
        };
        return new Observable<Result<string, string>>((observer) => {
            ejs.renderFile(path, renderedData, options, (err, renderedTemplate) => {
                if (err) {
                    Logger.error(err.message, err.stack);
                    observer.next(Err(err.message));
                    observer.complete();
                    return;
                }
                observer.next(Ok(renderedTemplate));
                observer.complete();
            });
        });
    }
}
