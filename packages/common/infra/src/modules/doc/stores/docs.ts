import type { DocMode } from '@blocksuite/affine/blocks';
import type { DocMeta } from '@blocksuite/affine/store';
import { isEqual } from 'lodash-es';
import { distinctUntilChanged, map, Observable } from 'rxjs';

import { Store } from '../../../framework';
import type { DocConfiguration, WorkspaceDBService } from '../../db';
import type { WorkspaceService } from '../../workspace';

export class DocsStore extends Store {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly dbService: WorkspaceDBService
  ) {
    super();
  }

  getBlockSuiteDoc(id: string) {
    return this.workspaceService.workspace.docCollection.getDoc(id);
  }

  createBlockSuiteDoc() {
    return this.workspaceService.workspace.docCollection.createDoc();
  }

  watchDocIds() {
    return new Observable<string[]>(subscriber => {
      const emit = () => {
        subscriber.next(
          this.workspaceService.workspace.docCollection.meta.docMetas.map(
            v => v.id
          )
        );
      };

      emit();

      const dispose =
        this.workspaceService.workspace.docCollection.meta.docMetaUpdated.on(
          emit
        ).dispose;
      return () => {
        dispose();
      };
    });
  }

  watchTrashDocIds() {
    return new Observable<string[]>(subscriber => {
      const emit = () => {
        subscriber.next(
          this.workspaceService.workspace.docCollection.meta.docMetas
            .map(v => (v.trash ? v.id : null))
            .filter(Boolean) as string[]
        );
      };

      emit();

      const dispose =
        this.workspaceService.workspace.docCollection.meta.docMetaUpdated.on(
          emit
        ).dispose;
      return () => {
        dispose();
      };
    });
  }

  watchDocMeta(id: string) {
    let meta: DocMeta | null = null;
    return new Observable<Partial<DocMeta>>(subscriber => {
      const emit = () => {
        if (meta === null) {
          // getDocMeta is heavy, so we cache the doc meta reference
          meta =
            this.workspaceService.workspace.docCollection.meta.getDocMeta(id) ||
            null;
        }
        subscriber.next({ ...meta });
      };

      emit();

      const dispose =
        this.workspaceService.workspace.docCollection.meta.docMetaUpdated.on(
          emit
        ).dispose;
      return () => {
        dispose();
      };
    }).pipe(distinctUntilChanged((p, c) => isEqual(p, c)));
  }

  watchDocListReady() {
    return this.workspaceService.workspace.engine.rootDocState$
      .map(state => !state.syncing)
      .asObservable();
  }

  setDocMeta(id: string, meta: Partial<DocMeta>) {
    this.workspaceService.workspace.docCollection.setDocMeta(id, meta);
  }

  setDocPrimaryModeSetting(id: string, mode: DocMode) {
    return this.updateDocConfiguration(id, { primaryMode: mode });
  }

  getDocPrimaryModeSetting(id: string) {
    return this.getDocConfiguration(id)?.primaryMode;
  }

  watchDocPrimaryModeSetting(id: string) {
    return this.watchDocConfiguration(id).pipe(
      map(config => config?.primaryMode)
    );
  }

  updateDocConfiguration(id: string, config: Partial<DocConfiguration>) {
    return this.dbService.db.docConfiguration.create({
      id,
      ...config,
    });
  }

  getDocConfiguration(id: string) {
    return this.dbService.db.docConfiguration.get(id);
  }

  watchDocConfiguration(id: string) {
    return this.dbService.db.docConfiguration.get$(id);
  }

  waitForDocLoadReady(id: string) {
    return this.workspaceService.workspace.engine.doc.waitForReady(id);
  }

  setPriorityLoad(id: string, priority: number) {
    return this.workspaceService.workspace.engine.doc.setPriority(id, priority);
  }

  markDocSyncStateAsReady(id: string) {
    this.workspaceService.workspace.engine.doc.markAsReady(id);
  }
}
