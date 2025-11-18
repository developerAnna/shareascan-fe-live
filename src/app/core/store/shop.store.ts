import {entityConfig, setEntities, withEntities} from '@ngrx/signals/entities';
import {signalStore, type, withComputed, withMethods} from '@ngrx/signals';
import {updateState, withDevtools} from '@angular-architects/ngrx-toolkit';
import {IShopDatum} from '../../shared/models/shop.model';

type ShopDatumEntityType = Required<IShopDatum>;
const ShopDatumEntityConfig = entityConfig({
  entity: type<ShopDatumEntityType>(),
  collection: '_shopDatum',
  selectId: (shopDatum) => shopDatum.id,
});

export const ShopDatumStoreSignal = signalStore(
  {providedIn: 'root'},
  withDevtools('ShopDatumStore'),
  withEntities(ShopDatumEntityConfig),
  withComputed(({_shopDatumEntities}) => ({
    getShopDatum: _shopDatumEntities,
  })),
  withMethods((store) => ({
    // Set shop datum
    setShopDatum(shopDatum: ShopDatumEntityType[]): void {
      updateState(
        store,
        '[ShopDatum] Set ShopDatum',
        setEntities(shopDatum, ShopDatumEntityConfig)
      );
    },
    // Find a shop datum by id
    getShopDatumById(id: number): ShopDatumEntityType | undefined {
      return store
        ._shopDatumEntities()
        .find((entity: ShopDatumEntityType) => entity.id === id);
    },
  }))
);
