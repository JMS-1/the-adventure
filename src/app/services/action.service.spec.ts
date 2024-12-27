import { TestBed } from '@angular/core/testing';
import { DeadAction } from '../actions/dead';
import { DropAction } from '../actions/drop';
import { HasAction } from '../actions/has';
import { HasThisAction } from '../actions/hasThis';
import { HereAction } from '../actions/here';
import { MessageAction } from '../actions/message';
import { MoveAction } from '../actions/move';
import { NotHasAction } from '../actions/notHas';
import { NotHasThisAction } from '../actions/notHasThis';
import { NotHereAction } from '../actions/notHere';
import { PickAction } from '../actions/pick';
import { PrintAction } from '../actions/print';
import { RandomAction } from '../actions/random';
import { TestMessageAction } from '../actions/testMessage';
import { TestPositionAction } from '../actions/testPosition';
import { TestStateAction } from '../actions/testState';
import { ActionService } from './action.service';

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
    expect(() => service.parse('', [], 0)).toThrowError(/unterminated/);

    expect(() => service.parse('', [''], 0)).toThrowError(/unterminated/);

    expect(() => service.parse('', ['', ''], 0)).toThrowError(/unterminated/);
  });
});

describe('ActionService assign message', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    let [map, index] = service.parse('message = test', [], 0);

    let actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    let action = actions[0] as MessageAction;

    expect(action).toBeInstanceOf(MessageAction);
    expect(action.message).toBe('test');
    expect(action.silent).toBeFalse();

    [map, index] = service.parse('@message = test', [], 0);

    actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as MessageAction;

    expect(action).toBeInstanceOf(MessageAction);
    expect(action.message).toBe('test');
    expect(action.silent).toBeTrue();

    [map, index] = service.parse('', ['', 'message = test'], 0);

    actions = map[''];

    expect(index).toBe(1);
    expect(actions.length).toBe(1);

    action = actions[0] as MessageAction;

    expect(action).toBeInstanceOf(MessageAction);
    expect(action.message).toBe('test');
    expect(action.silent).toBeFalse();

    [map, index] = service.parse('@message = *', [], 0);

    actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as MessageAction;

    expect(action).toBeInstanceOf(MessageAction);
    expect(action.message).toBe('*');
    expect(action.silent).toBeTrue();
  });
});

describe('ActionService sequence', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    let [map, index] = service.parse(
      '(message = 1, @message = 2)',

      [],
      0
    );

    let actions = map[''];

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

    [map, index] = service.parse(
      '',

      ['', '(', 'message = 1,', '@message = 2', ')'],
      0
    );

    actions = map[''];

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
});

describe('ActionService random choice', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    const [map, index] = service.parse(
      '[message = 1, @message = 2)',

      [],
      0
    );

    const actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    const action = actions[0] as RandomAction;

    expect(action).toBeInstanceOf(RandomAction);
    expect(action.choices.length).toBe(2);
  });
});

describe('ActionService pick something', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    let [map, index] = service.parse('<test', [], 0);

    let actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    let action = actions[0] as PickAction;

    expect(action).toBeInstanceOf(PickAction);
    expect(action.what).toBe('test');
    expect(action.silent).toBeFalse();
    expect(action.self).toBeFalse();

    [map, index] = service.parse('@<test', [], 0);

    actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as PickAction;

    expect(action).toBeInstanceOf(PickAction);
    expect(action.what).toBe('test');
    expect(action.silent).toBeTrue();
    expect(action.self).toBeFalse();

    [map, index] = service.parse('#<test', [], 0);

    actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as PickAction;

    expect(action).toBeInstanceOf(PickAction);
    expect(action.what).toBe('test');
    expect(action.silent).toBeFalse();
    expect(action.self).toBeTrue();

    [map, index] = service.parse('@#<test', [], 0);

    actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as PickAction;

    expect(action).toBeInstanceOf(PickAction);
    expect(action.what).toBe('test');
    expect(action.silent).toBeTrue();
    expect(action.self).toBeTrue();
  });
});

describe('ActionService die', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    const [map, index] = service.parse('>>test', [], 0);

    const actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    const action = actions[0] as DeadAction;

    expect(action).toBeInstanceOf(DeadAction);
    expect(action.reason).toBe('test');
  });
});

describe('ActionService move', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    let [map, index] = service.parse('>room', [], 0);

    let actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    let action = actions[0] as MoveAction;

    expect(action).toBeInstanceOf(MoveAction);
    expect(action.area).toBeNull();
    expect(action.room).toBe('room');
    expect(action.self).toBeFalse();

    [map, index] = service.parse('#>$$area$room', [], 0);

    actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as MoveAction;

    expect(action).toBeInstanceOf(MoveAction);
    expect(action.area).toBe('area');
    expect(action.room).toBe('room');
    expect(action.self).toBeTrue();
  });
});

describe('ActionService print', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    let [map, index] = service.parse('&$$who$test', [], 0);
    let actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    let action = actions[0] as PrintAction;

    expect(action).toBeInstanceOf(PrintAction);
    expect(action.area).toBe('who');
    expect(action.message).toBe('test');

    [map, index] = service.parse('&test', [], 0);
    actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as PrintAction;

    expect(action).toBeInstanceOf(PrintAction);
    expect(action.area).toBeNull();
    expect(action.message).toBe('test');
  });
});

describe('ActionService test message', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    let [map, index] = service.parse(
      'if_message test message = junk',

      [],
      0
    );

    let actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    let action = actions[0] as TestMessageAction;

    expect(action).toBeInstanceOf(TestMessageAction);
    expect(action.message).toBe('test');
    expect(action.actions.length).toBe(1);

    [map, index] = service.parse(
      'if_message test',

      ['', 'message = junk'],
      0
    );

    actions = map[''];

    expect(index).toBe(1);
    expect(actions.length).toBe(1);

    action = actions[0] as TestMessageAction;

    expect(action).toBeInstanceOf(TestMessageAction);
    expect(action.message).toBe('test');
    expect(action.actions.length).toBe(1);

    [map, index] = service.parse(
      'if_message test (message = junk)',

      [],
      0
    );

    actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as TestMessageAction;

    expect(action).toBeInstanceOf(TestMessageAction);
    expect(action.message).toBe('test');
    expect(action.actions.length).toBe(1);

    [map, index] = service.parse(
      'if_message test',

      ['', '(', 'message = junk', ')'],
      0
    );

    actions = map[''];

    expect(index).toBe(3);
    expect(actions.length).toBe(1);

    action = actions[0] as TestMessageAction;

    expect(action).toBeInstanceOf(TestMessageAction);
    expect(action.message).toBe('test');
    expect(action.actions.length).toBe(1);
  });
});

describe('ActionService test state', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    const [map, index] = service.parse(
      'if_state thing message message = junk',

      [],
      0
    );

    const actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    const action = actions[0] as TestStateAction;

    expect(action).toBeInstanceOf(TestStateAction);
    expect(action.obj).toBe('thing');
    expect(action.message).toBe('message');
    expect(action.actions.length).toBe(1);
  });
});

describe('ActionService test position', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    let [map, index] = service.parse(
      'if_position $$area$room message = junk',

      [],
      0
    );

    let actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    let action = actions[0] as TestPositionAction;

    expect(action).toBeInstanceOf(TestPositionAction);
    expect(action.area).toBe('area');
    expect(action.room).toBe('room');
    expect(action.self).toBeFalse();
    expect(action.actions.length).toBe(1);

    [map, index] = service.parse(
      '#if_position $$area$room (message = junk, message = *)',

      [],
      0
    );

    actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as TestPositionAction;

    expect(action).toBeInstanceOf(TestPositionAction);
    expect(action.area).toBe('area');
    expect(action.room).toBe('room');
    expect(action.self).toBeTrue();
    expect(action.actions.length).toBe(2);
  });
});

describe('ActionService test thing', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('has', () => {
    const [map, index] = service.parse(
      'if_has what message = junk',

      [],
      0
    );

    const actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    const action = actions[0] as HasAction;

    expect(action).toBeInstanceOf(HasAction);
    expect(action.obj).toBe('what');
    expect(action.actions.length).toBe(1);
  });

  it('not has', () => {
    const [map, index] = service.parse(
      'if_nothas what message = junk',

      [],
      0
    );

    const actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    const action = actions[0] as NotHasAction;

    expect(action).toBeInstanceOf(NotHasAction);
    expect(action.obj).toBe('what');
    expect(action.actions.length).toBe(1);
  });

  it('has this', () => {
    const [map, index] = service.parse(
      'if_hasthis message = junk',

      [],
      0
    );

    const actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    const action = actions[0] as HasThisAction;

    expect(action).toBeInstanceOf(HasThisAction);
    expect(action.actions.length).toBe(1);
  });

  it('not has this', () => {
    const [map, index] = service.parse(
      'if_nothasthis message = junk',

      [],
      0
    );

    const actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    const action = actions[0] as NotHasThisAction;

    expect(action).toBeInstanceOf(NotHasThisAction);
    expect(action.actions.length).toBe(1);
  });
});

describe('ActionService test here', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('here', () => {
    const [map, index] = service.parse(
      'if_here what message = junk',

      [],
      0
    );

    const actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    const action = actions[0] as HereAction;

    expect(action).toBeInstanceOf(HereAction);
    expect(action.obj).toBe('what');
    expect(action.actions.length).toBe(1);
  });

  it('not here', () => {
    const [map, index] = service.parse(
      'if_nothere what message = junk',

      [],
      0
    );

    const actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    const action = actions[0] as NotHereAction;

    expect(action).toBeInstanceOf(NotHereAction);
    expect(action.obj).toBe('what');
    expect(action.actions.length).toBe(1);
  });
});

describe('ActionService drop something', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    let [map, index] = service.parse('!test', [], 0);

    let actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    let action = actions[0] as DropAction;

    expect(action).toBeInstanceOf(DropAction);
    expect(action.what).toBe('test');
    expect(action.silent).toBeFalse();
    expect(action.self).toBeFalse();

    [map, index] = service.parse('@!test', [], 0);

    actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as DropAction;

    expect(action).toBeInstanceOf(DropAction);
    expect(action.what).toBe('test');
    expect(action.silent).toBeTrue();
    expect(action.self).toBeFalse();

    [map, index] = service.parse('#!test', [], 0);

    actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as DropAction;

    expect(action).toBeInstanceOf(DropAction);
    expect(action.what).toBe('test');
    expect(action.silent).toBeFalse();
    expect(action.self).toBeTrue();

    [map, index] = service.parse('@#!test', [], 0);

    actions = map[''];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as DropAction;

    expect(action).toBeInstanceOf(DropAction);
    expect(action.what).toBe('test');
    expect(action.silent).toBeTrue();
    expect(action.self).toBeTrue();
  });
});

describe('ActionService single key', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    const [map, index] = service.parseNamed('+13: message=test', [], 0);

    const actions = map['+13'];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    const action = actions[0] as MessageAction;

    expect(action).toBeInstanceOf(MessageAction);
    expect(action.message).toBe('test');
    expect(action.silent).toBeFalse();
  });
});

describe('ActionService multi key', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    let [map, index] = service.parseMultiple('+13: message=test', [], 0);

    let actions = map['+13'];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    let action = actions[0] as MessageAction;

    expect(action).toBeInstanceOf(MessageAction);
    expect(action.message).toBe('test');
    expect(action.silent).toBeFalse();

    [map, index] = service.parseMultiple('(+13: message=test)', [], 0);

    actions = map['+13'];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as MessageAction;

    expect(action).toBeInstanceOf(MessageAction);
    expect(action.message).toBe('test');
    expect(action.silent).toBeFalse();

    [map, index] = service.parseMultiple(
      '(+13: message=test, +14: message=more)',
      [],
      0
    );

    actions = map['+13'];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as MessageAction;

    expect(action).toBeInstanceOf(MessageAction);
    expect(action.message).toBe('test');
    expect(action.silent).toBeFalse();

    actions = map['+14'];

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as MessageAction;

    expect(action).toBeInstanceOf(MessageAction);
    expect(action.message).toBe('more');
    expect(action.silent).toBeFalse();
  });
});
