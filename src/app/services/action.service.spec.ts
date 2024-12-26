import { TestBed } from '@angular/core/testing';

import { ActionService } from './action.service';
import {
  DeadAction,
  MessageAction,
  MoveAction,
  PickAction,
  PrintAction,
} from './actions';

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
    expect(action.silent).toBeFalse();

    [actions, index] = service.parse('@message = test', 'single', [], 0);

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as MessageAction;

    expect(action).toBeInstanceOf(MessageAction);
    expect(action.message).toBe('test');
    expect(action.silent).toBeTrue();

    [actions, index] = service.parse('', 'single', ['', 'message = test'], 0);

    expect(index).toBe(1);
    expect(actions.length).toBe(1);

    action = actions[0] as MessageAction;

    expect(action).toBeInstanceOf(MessageAction);
    expect(action.message).toBe('test');
    expect(action.silent).toBeFalse();

    [actions, index] = service.parse('@message = *', 'multiple', [], 0);

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as MessageAction;

    expect(action).toBeInstanceOf(MessageAction);
    expect(action.message).toBe('*');
    expect(action.silent).toBeTrue();
  });

  it('invalid', () => {
    expect(() => service.parse('message = ', 'none', [], 0)).toThrowError(
      /unterminated/
    );
  });
});

describe('ActionService sequence', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    let [actions, index] = service.parse(
      '(message = 1, @message = 2)',
      'none',
      [],
      0
    );

    expect(index).toBe(0);
    expect(actions.length).toBe(2);

    let action = actions[0] as MessageAction;

    expect(action).toBeInstanceOf(MessageAction);
    expect(action.message).toBe('1');
    expect(action.silent).toBeFalse();

    action = actions[1] as MessageAction;

    expect(action).toBeInstanceOf(MessageAction);
    expect(action.message).toBe('2');
    expect(action.silent).toBeTrue();

    [actions, index] = service.parse(
      '',
      'none',
      ['', '(', 'message = 1,', '@message = 2', ')'],
      0
    );

    expect(index).toBe(4);
    expect(actions.length).toBe(2);

    action = actions[0] as MessageAction;

    expect(action).toBeInstanceOf(MessageAction);
    expect(action.message).toBe('1');
    expect(action.silent).toBeFalse();

    action = actions[1] as MessageAction;

    expect(action).toBeInstanceOf(MessageAction);
    expect(action.message).toBe('2');
    expect(action.silent).toBeTrue();
  });

  it('invalid', () => {
    expect(() =>
      service.parse('(message = 1, @message = 2', 'none', [], 0)
    ).toThrowError(/unterminated/);

    expect(() =>
      service.parse('(message = 1 @message = 2', 'none', [], 0)
    ).toThrowError(/comma/);
  });
});

describe('ActionService pick something', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    let [actions, index] = service.parse('<test', 'none', [], 0);

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    let action = actions[0] as PickAction;

    expect(action).toBeInstanceOf(PickAction);
    expect(action.what).toBe('test');
    expect(action.silent).toBeFalse();
    expect(action.always).toBeFalse();

    [actions, index] = service.parse('@<test', 'none', [], 0);

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as PickAction;

    expect(action).toBeInstanceOf(PickAction);
    expect(action.what).toBe('test');
    expect(action.silent).toBeTrue();
    expect(action.always).toBeFalse();

    [actions, index] = service.parse('#<test', 'none', [], 0);

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as PickAction;

    expect(action).toBeInstanceOf(PickAction);
    expect(action.what).toBe('test');
    expect(action.silent).toBeFalse();
    expect(action.always).toBeTrue();

    [actions, index] = service.parse('@#<test', 'none', [], 0);

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as PickAction;

    expect(action).toBeInstanceOf(PickAction);
    expect(action.what).toBe('test');
    expect(action.silent).toBeTrue();
    expect(action.always).toBeTrue();
  });

  it('invalid', () => {
    expect(() => service.parse('<', 'none', [], 0)).toThrowError(
      /unterminated/
    );
  });
});

describe('ActionService die', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    const [actions, index] = service.parse('>>test', 'none', [], 0);

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    const action = actions[0] as DeadAction;

    expect(action).toBeInstanceOf(DeadAction);
    expect(action.reason).toBe('test');
  });

  it('invalid', () => {
    expect(() => service.parse('>>', 'none', [], 0)).toThrowError(
      /unterminated/
    );
  });
});

describe('ActionService move', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    let [actions, index] = service.parse('>room', 'none', [], 0);

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    let action = actions[0] as MoveAction;

    expect(action).toBeInstanceOf(MoveAction);
    expect(action.area).toBeNull();
    expect(action.room).toBe('room');
    expect(action.always).toBeFalse();

    [actions, index] = service.parse('#>$$area$room', 'none', [], 0);

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as MoveAction;

    expect(action).toBeInstanceOf(MoveAction);
    expect(action.area).toBe('area');
    expect(action.room).toBe('room');
    expect(action.always).toBeTrue();
  });

  it('invalid', () => {
    expect(() => service.parse('>', 'none', [], 0)).toThrowError(
      /unterminated/
    );
  });
});

describe('ActionService print', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    const [actions, index] = service.parse('&$$who$test', 'none', [], 0);

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    const action = actions[0] as PrintAction;

    expect(action).toBeInstanceOf(PrintAction);
    expect(action.obj).toBe('who');
    expect(action.message).toBe('test');
  });

  it('invalid', () => {
    expect(() => service.parse('&', 'none', [], 0)).toThrowError(
      /unterminated/
    );

    expect(() => service.parse('&$$$xxx', 'none', [], 0)).toThrowError(
      /unterminated/
    );
  });
});
