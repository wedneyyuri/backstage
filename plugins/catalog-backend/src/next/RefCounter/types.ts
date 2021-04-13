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

export interface RefCounter {
  /**
   * Creates or updates the refs from the given source. All existing refs
   * from the source will be removed and replaced with the new ones.
   *
   * @param source An opaque string identifier for the source.
   * @param targets A set of opaque string identifiers for each target.
   */
  setRefs(
    context: Context,
    source: string,
    targets: string[],
  ): Promise<{ orphaned: string[] }>;

  /**
   * Removes all references pointing to the provided target.
   *
   * @param source An opaque string identifier for the target.
   */
  removeTargetRefs(context: Context, target: string): Promise<void>;

  /**
   * Returns true if the target identifier has no refs pointing towards it.
   *
   * @param source An opaque string identifier for the target.
   */
  isOrphan(context: Context, target: string): Promise<boolean>;
}
