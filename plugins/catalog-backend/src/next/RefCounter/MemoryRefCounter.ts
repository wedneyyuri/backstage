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

import { Context } from '../Context';
import { RefCounter } from './types';

export class MemoryRefCounter implements RefCounter {
  #refs = new Map<string, Set<string>>();
  #reverseRefs = new Map<string, Set<string>>();

  async setRefs(
    _context: Context,
    source: string,
    targets: string[],
  ): Promise<{ orphaned: string[] }> {
    const newOrphans = new Set<string>();

    const oldTargets = this.#refs.get(source);
    oldTargets?.forEach(oldTarget => {
      const sourceRefs = this.#reverseRefs.get(oldTarget)!;
      sourceRefs.delete(source);

      if (sourceRefs.size === 0) {
        newOrphans.add(oldTarget);
        this.#reverseRefs.delete(oldTarget);
      }
    });

    const newTargets = new Set(targets);
    newTargets.forEach(newTarget => {
      newOrphans.delete(newTarget);

      if (this.#reverseRefs.has(newTarget)) {
        this.#reverseRefs.get(newTarget)!.add(source);
      } else {
        this.#reverseRefs.set(newTarget, new Set([source]));
      }
    });

    if (newTargets.size === 0) {
      this.#refs.delete(source);
    } else {
      this.#refs.set(source, newTargets);
    }

    return { orphaned: Array.from(newOrphans) };
  }

  async removeTargetRefs(_context: Context, target: string): Promise<void> {
    this.#reverseRefs.get(target)?.forEach(sourceRef => {
      this.#refs.get(sourceRef)!.delete(target);
    });

    this.#reverseRefs.delete(target);
  }

  async isOrphan(_context: Context, target: string): Promise<boolean> {
    return !this.#reverseRefs.has(target);
  }

  toString() {
    const refs = Array.from(this.#refs)
      .map(([s, t]) => `${s}->${Array.from(t).join(',')}`)
      .join(';');
    const reverseRefs = Array.from(this.#reverseRefs)
      .map(([s, t]) => `${s}->${Array.from(t).join(',')}`)
      .join(';');
    return `memoryRefCounter(refs=${refs},reverseRefs=${reverseRefs})`;
  }
}
