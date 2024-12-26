import { TestBed } from '@angular/core/testing';

import { ActionService, MessageAction } from './action.service';

describe('ActionService', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('must not be empty', () => {
    expect(() => service.parse('', 'none', [], 0)).toThrowError(/unterminated/);

    expect(() => service.parse('', 'single', [''], 0)).toThrowError(
      /unterminated/
    );

    expect(() => service.parse('', 'multiple', ['', ''], 0)).toThrowError(
      /unterminated/
    );
  });
});

describe('ActionService assign message', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    let [actions, index] = service.parse('message = test', 'none', [], 0);

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    let action = actions[0] as MessageAction;

    expect(action).toBeInstanceOf(MessageAction);
    expect(action.message).toBe('test');
    expect(action.optional).toBeFalse();

    [actions, index] = service.parse('@message = test', 'single', [], 0);

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as MessageAction;

    expect(action).toBeInstanceOf(MessageAction);
    expect(action.message).toBe('test');
    expect(action.optional).toBeTrue();

    [actions, index] = service.parse('', 'single', ['', 'message = test'], 0);

    expect(index).toBe(1);
    expect(actions.length).toBe(1);

    action = actions[0] as MessageAction;

    expect(action).toBeInstanceOf(MessageAction);
    expect(action.message).toBe('test');
    expect(action.optional).toBeFalse();

    [actions, index] = service.parse('@message = *', 'multiple', [], 0);

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as MessageAction;

    expect(action).toBeInstanceOf(MessageAction);
    expect(action.message).toBe('*');
    expect(action.optional).toBeTrue();
  });

  it('invalid', () => {
    expect(() => service.parse('message = ', 'none', [], 0)).toThrowError(
      /unknown/
    );
  });
});
