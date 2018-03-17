/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { join, normalize, virtualFs } from '@angular-devkit/core';
import { tap } from 'rxjs/operators';
import { TestProjectHost, browserWorkspaceTarget, runTargetSpec, workspaceRoot } from '../utils';


describe('Browser Builder source map', () => {
  const host = new TestProjectHost(workspaceRoot);
  const outputPath = normalize('dist');

  beforeEach(done => host.initialize().subscribe(undefined, done.fail, done));
  afterEach(done => host.restore().subscribe(undefined, done.fail, done));

  it('works', (done) => {
    const overrides = { sourceMap: true };

    runTargetSpec(host, browserWorkspaceTarget, overrides).pipe(
      tap((buildEvent) => expect(buildEvent.success).toBe(true)),
      tap(() => {
        const fileName = join(outputPath, 'main.js.map');
        expect(host.asSync().exists(fileName)).toBe(true);
      }),
    ).subscribe(undefined, done.fail, done);
  }, 30000);

  it('does not output source map when disabled', (done) => {
    const overrides = { sourceMap: false };

    runTargetSpec(host, browserWorkspaceTarget, overrides).pipe(
      tap((buildEvent) => expect(buildEvent.success).toBe(true)),
      tap(() => {
        const fileName = join(outputPath, 'main.js.map');
        expect(host.asSync().exists(fileName)).toBe(false);
      }),
    ).subscribe(undefined, done.fail, done);
  }, 30000);

  it('supports eval source map', (done) => {
    const overrides = { sourceMap: true, evalSourceMap: true };

    runTargetSpec(host, browserWorkspaceTarget, overrides).pipe(
      tap((buildEvent) => expect(buildEvent.success).toBe(true)),
      tap(() => {
        expect(host.asSync().exists(join(outputPath, 'main.js.map'))).toBe(false);
        const fileName = join(outputPath, 'main.js');
        const content = virtualFs.fileBufferToString(host.asSync().read(fileName));
        expect(content).toContain('eval("function webpackEmptyAsyncContext');
      }),
    ).subscribe(undefined, done.fail, done);
  }, 30000);
});
