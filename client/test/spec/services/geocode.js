'use strict';

describe('Service: Geocode', function () {

  // load the service's module
  beforeEach(module('clientApp'));

  // instantiate service
  var Geocode;
  beforeEach(inject(function (_Geocode_) {
    Geocode = _Geocode_;
  }));

  it('should do something', function () {
    expect(!!Geocode).toBe(true);
  });

});
