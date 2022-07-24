export const priceTypePriceUnits = {
    Flat: ['priceUnitId'],
    'On Call Basis Fixed': [
      'basisPriceUnitId'
    ],
    Fixed: [
      'futurePriceUnitId',
      'basisPriceUnitId',
      'priceUnitId'
    ],
    FormulaPricing: ['priceUnitId'],
    'Futures First': [
      'futurePriceUnitId',
      'basisPriceUnitId'
    ]
};