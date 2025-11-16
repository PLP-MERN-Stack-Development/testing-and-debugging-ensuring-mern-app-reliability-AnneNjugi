const { requestLogger } = require('../../src/middleware/logger');

describe('Logger Middleware', () => {
  let req, res, next;
  let consoleLogSpy;

  beforeEach(() => {
    req = {
      method: 'GET',
      path: '/api/test'
    };
    res = {
      on: jest.fn(),
      statusCode: 200
    };
    next = jest.fn();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  test('should log incoming request', () => {
    requestLogger(req, res, next);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /api/test')
    );
    expect(next).toHaveBeenCalled();
  });

  test('should register finish event listener', () => {
    requestLogger(req, res, next);

    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
  });

  test('should log response when finished', () => {
    let finishCallback;
    res.on.mockImplementation((event, callback) => {
      if (event === 'finish') {
        finishCallback = callback;
      }
    });

    requestLogger(req, res, next);
    
    // Simulate finish event
    finishCallback();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /api/test - 200')
    );
  });

  test('should call next middleware', () => {
    requestLogger(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
