/*
 * Copyright 2021 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { BaseContext } from '../Context';
import { MemoryRefCounter } from './MemoryRefCounter';

describe('MemoryRefCounter', () => {
  it('should keep track of refs', async () => {
    const ctx = new BaseContext();
    const counter = new MemoryRefCounter();

    await expect(counter.isOrphan(ctx, 'a')).resolves.toBe(true);
    await expect(counter.isOrphan(ctx, 'b')).resolves.toBe(true);
    await expect(counter.isOrphan(ctx, 'c')).resolves.toBe(true);

    await expect(counter.setRefs(ctx, 'a', ['b', 'c'])).resolves.toEqual({
      orphaned: [],
    });
    await expect(counter.isOrphan(ctx, 'a')).resolves.toBe(true);
    await expect(counter.isOrphan(ctx, 'b')).resolves.toBe(false);
    await expect(counter.isOrphan(ctx, 'c')).resolves.toBe(false);

    await counter.removeTargetRefs(ctx, 'b');
    await expect(counter.isOrphan(ctx, 'a')).resolves.toBe(true);
    await expect(counter.isOrphan(ctx, 'b')).resolves.toBe(true);
    await expect(counter.isOrphan(ctx, 'c')).resolves.toBe(false);

    await expect(counter.setRefs(ctx, 'a', ['b', 'b'])).resolves.toEqual({
      orphaned: ['c'],
    });
    await expect(counter.isOrphan(ctx, 'a')).resolves.toBe(true);
    await expect(counter.isOrphan(ctx, 'b')).resolves.toBe(false);
    await expect(counter.isOrphan(ctx, 'c')).resolves.toBe(true);

    await counter.removeTargetRefs(ctx, 'a');
    await counter.removeTargetRefs(ctx, 'c');
    await expect(counter.isOrphan(ctx, 'a')).resolves.toBe(true);
    await expect(counter.isOrphan(ctx, 'b')).resolves.toBe(false);
    await expect(counter.isOrphan(ctx, 'c')).resolves.toBe(true);

    await counter.removeTargetRefs(ctx, 'b');
    await expect(counter.isOrphan(ctx, 'a')).resolves.toBe(true);
    await expect(counter.isOrphan(ctx, 'b')).resolves.toBe(true);
    await expect(counter.isOrphan(ctx, 'c')).resolves.toBe(true);

    await expect(counter.setRefs(ctx, 'a', ['b', 'c'])).resolves.toEqual({
      orphaned: [],
    });
    await expect(counter.setRefs(ctx, 'b', ['a', 'c'])).resolves.toEqual({
      orphaned: [],
    });
    await expect(counter.setRefs(ctx, 'c', ['a', 'b', 'b'])).resolves.toEqual({
      orphaned: [],
    });
    await expect(counter.isOrphan(ctx, 'a')).resolves.toBe(false);
    await expect(counter.isOrphan(ctx, 'b')).resolves.toBe(false);
    await expect(counter.isOrphan(ctx, 'c')).resolves.toBe(false);

    await counter.removeTargetRefs(ctx, 'a');
    await expect(counter.isOrphan(ctx, 'a')).resolves.toBe(true);
    await expect(counter.isOrphan(ctx, 'b')).resolves.toBe(false);
    await expect(counter.isOrphan(ctx, 'c')).resolves.toBe(false);

    await expect(counter.setRefs(ctx, 'c', [])).resolves.toEqual({
      orphaned: [],
    });
    await expect(counter.isOrphan(ctx, 'a')).resolves.toBe(true);
    await expect(counter.isOrphan(ctx, 'b')).resolves.toBe(false);
    await expect(counter.isOrphan(ctx, 'c')).resolves.toBe(false);

    await expect(counter.setRefs(ctx, 'a', [])).resolves.toEqual({
      orphaned: ['b'],
    });
    await expect(counter.isOrphan(ctx, 'a')).resolves.toBe(true);
    await expect(counter.isOrphan(ctx, 'b')).resolves.toBe(true);
    await expect(counter.isOrphan(ctx, 'c')).resolves.toBe(false);

    await expect(counter.setRefs(ctx, 'b', [])).resolves.toEqual({
      orphaned: ['c'],
    });
    await expect(counter.isOrphan(ctx, 'a')).resolves.toBe(true);
    await expect(counter.isOrphan(ctx, 'b')).resolves.toBe(true);
    await expect(counter.isOrphan(ctx, 'c')).resolves.toBe(true);
  });
});
