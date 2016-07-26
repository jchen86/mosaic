describe('colorCalculator', function () {
  var imageData;

  beforeEach(function () {
    imageData = createMockImageData();
  });

  it('should return average color in r, g, b', function () {
    var result = colorCalculator.getTileAverageColor(imageData, 1, 1, 2, 2);
    expect(result).toEqual({r: 40, g: 45, b: 50});
  });

  it('should return average color in hex', function () {
    var result = colorCalculator.getTileAverageColorAsHex(imageData, 1, 1, 2, 2);
    expect(result).toBe('282d32');
  });

  function createMockImageData() {
    return {
      width: 8,
      data: [
        0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75,
        10, 15, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 10, 15, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175,
        0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75,
        10, 15, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 10, 15, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175
      ]
    };
  }
});