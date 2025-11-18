import {entityConfig, setEntities, withEntities} from '@ngrx/signals/entities';
import {signalStore, type, withComputed, withMethods} from '@ngrx/signals';
import {updateState, withDevtools} from '@angular-architects/ngrx-toolkit';
import {IQrCodeDatum} from '../../shared/models/product.model';

type QrCodeDatumEntityType = Required<IQrCodeDatum>;
const QrCodeDatumEntityConfig = entityConfig({
  entity: type<QrCodeDatumEntityType>(),
  collection: '_qrCodeDatum',
  selectId: (qrCodeDatum) => qrCodeDatum.id,
});

export const QrCodeDatumStoreSignal = signalStore(
  {providedIn: 'root'},
  withDevtools('QrCodeDatumStore'),
  withEntities(QrCodeDatumEntityConfig),
  withComputed(({_qrCodeDatumEntities}) => ({
    getQRCodeDatum: _qrCodeDatumEntities,
  })),
  withMethods((store) => ({
    // Set QR code datum
    setQrCodeDatum(qrCodeDatum: QrCodeDatumEntityType[]): void {
      updateState(
        store,
        '[QrCodeDatum] Set QrCodeDatum',
        setEntities(qrCodeDatum, QrCodeDatumEntityConfig)
      );
    },
    // Find a QR code datum by id
    getQrCodeDatumById(id: number): QrCodeDatumEntityType | undefined {
      return store
        ._qrCodeDatumEntities()
        .find((entity: QrCodeDatumEntityType) => entity.id === id);
    },
  }))
);
