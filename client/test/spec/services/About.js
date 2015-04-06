'use strict';

describe('Service: About', function () {

  // load the service's module
  beforeEach(module('clientApp'));

  // instantiate service
  var About;
  beforeEach(inject(function (_About_) {
    About = _About_;
  }));

  it('should do something', function () {
    expect(!!About).toBe(true);
  });

});
