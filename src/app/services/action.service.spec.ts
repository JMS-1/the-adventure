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

describe('ActionService random choice', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    const [actions, index] = service.parse(
      '[message = 1, @message = 2)',
      'none',
      [],
      0
    );

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    const action = actions[0] as RandomAction;

    expect(action).toBeInstanceOf(RandomAction);
    expect(action.choices.length).toBe(2);
  });

  it('invalid', () => {
    expect(() =>
      service.parse('[message = 1, @message = 2', 'none', [], 0)
    ).toThrowError(/unterminated/);

    expect(() =>
      service.parse('[message = 1 @message = 2', 'none', [], 0)
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
    expect(action.self).toBeFalse();

    [actions, index] = service.parse('@<test', 'none', [], 0);

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as PickAction;

    expect(action).toBeInstanceOf(PickAction);
    expect(action.what).toBe('test');
    expect(action.silent).toBeTrue();
    expect(action.self).toBeFalse();

    [actions, index] = service.parse('#<test', 'none', [], 0);

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as PickAction;

    expect(action).toBeInstanceOf(PickAction);
    expect(action.what).toBe('test');
    expect(action.silent).toBeFalse();
    expect(action.self).toBeTrue();

    [actions, index] = service.parse('@#<test', 'none', [], 0);

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as PickAction;

    expect(action).toBeInstanceOf(PickAction);
    expect(action.what).toBe('test');
    expect(action.silent).toBeTrue();
    expect(action.self).toBeTrue();
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
    expect(action.self).toBeFalse();

    [actions, index] = service.parse('#>$$area$room', 'none', [], 0);

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as MoveAction;

    expect(action).toBeInstanceOf(MoveAction);
    expect(action.area).toBe('area');
    expect(action.room).toBe('room');
    expect(action.self).toBeTrue();
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

describe('ActionService test message', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    let [actions, index] = service.parse(
      'if_message test message = junk',
      'none',
      [],
      0
    );

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    let action = actions[0] as TestMessageAction;

    expect(action).toBeInstanceOf(TestMessageAction);
    expect(action.message).toBe('test');
    expect(action.actions.length).toBe(1);

    [actions, index] = service.parse(
      'if_message test',
      'none',
      ['', 'message = junk'],
      0
    );

    expect(index).toBe(1);
    expect(actions.length).toBe(1);

    action = actions[0] as TestMessageAction;

    expect(action).toBeInstanceOf(TestMessageAction);
    expect(action.message).toBe('test');
    expect(action.actions.length).toBe(1);

    [actions, index] = service.parse(
      'if_message test (message = junk)',
      'none',
      [],
      0
    );

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as TestMessageAction;

    expect(action).toBeInstanceOf(TestMessageAction);
    expect(action.message).toBe('test');
    expect(action.actions.length).toBe(1);

    [actions, index] = service.parse(
      'if_message test',
      'none',
      ['', '(', 'message = junk', ')'],
      0
    );

    expect(index).toBe(3);
    expect(actions.length).toBe(1);

    action = actions[0] as TestMessageAction;

    expect(action).toBeInstanceOf(TestMessageAction);
    expect(action.message).toBe('test');
    expect(action.actions.length).toBe(1);
  });

  it('invalid', () => {
    expect(() => service.parse('if_message', 'none', [], 0)).toThrowError(
      /unterminated/
    );

    expect(() => service.parse('if_message xxx', 'none', [], 0)).toThrowError(
      /unterminated/
    );
  });
});

describe('ActionService test state', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    const [actions, index] = service.parse(
      'if_state thing message message = junk',
      'none',
      [],
      0
    );

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    const action = actions[0] as TestStateAction;

    expect(action).toBeInstanceOf(TestStateAction);
    expect(action.obj).toBe('thing');
    expect(action.message).toBe('message');
    expect(action.actions.length).toBe(1);
  });

  it('invalid', () => {
    expect(() => service.parse('if_state', 'none', [], 0)).toThrowError(
      /unterminated/
    );

    expect(() => service.parse('if_state xxx', 'none', [], 0)).toThrowError(
      /unterminated/
    );

    expect(() => service.parse('if_state xxx yyy', 'none', [], 0)).toThrowError(
      /unterminated/
    );
  });
});

describe('ActionService test position', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    let [actions, index] = service.parse(
      'if_position $$area$room message = junk',
      'none',
      [],
      0
    );

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    let action = actions[0] as TestPositionAction;

    expect(action).toBeInstanceOf(TestPositionAction);
    expect(action.area).toBe('area');
    expect(action.room).toBe('room');
    expect(action.self).toBeFalse();
    expect(action.actions.length).toBe(1);

    [actions, index] = service.parse(
      '#if_position $$area$room (message = junk, message = *)',
      'none',
      [],
      0
    );

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as TestPositionAction;

    expect(action).toBeInstanceOf(TestPositionAction);
    expect(action.area).toBe('area');
    expect(action.room).toBe('room');
    expect(action.self).toBeTrue();
    expect(action.actions.length).toBe(2);
  });

  it('invalid', () => {
    expect(() => service.parse('if_position', 'none', [], 0)).toThrowError(
      /unterminated/
    );

    expect(() => service.parse('if_position xxx', 'none', [], 0)).toThrowError(
      /unterminated/
    );
  });
});

describe('ActionService test thing', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('has', () => {
    const [actions, index] = service.parse(
      'if_has what message = junk',
      'none',
      [],
      0
    );

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    const action = actions[0] as HasAction;

    expect(action).toBeInstanceOf(HasAction);
    expect(action.obj).toBe('what');
    expect(action.actions.length).toBe(1);
  });

  it('not has', () => {
    const [actions, index] = service.parse(
      'if_nothas what message = junk',
      'none',
      [],
      0
    );

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    const action = actions[0] as NotHasAction;

    expect(action).toBeInstanceOf(NotHasAction);
    expect(action.obj).toBe('what');
    expect(action.actions.length).toBe(1);
  });

  it('has this', () => {
    const [actions, index] = service.parse(
      'if_hasthis message = junk',
      'none',
      [],
      0
    );

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    const action = actions[0] as HasThisAction;

    expect(action).toBeInstanceOf(HasThisAction);
    expect(action.actions.length).toBe(1);
  });

  it('not has this', () => {
    const [actions, index] = service.parse(
      'if_nothasthis message = junk',
      'none',
      [],
      0
    );

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    const action = actions[0] as NotHasThisAction;

    expect(action).toBeInstanceOf(NotHasThisAction);
    expect(action.actions.length).toBe(1);
  });

  it('invalid', () => {
    expect(() => service.parse('if_has', 'none', [], 0)).toThrowError(
      /unterminated/
    );

    expect(() => service.parse('if_nothas', 'none', [], 0)).toThrowError(
      /unterminated/
    );
  });
});

describe('ActionService test here', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('here', () => {
    const [actions, index] = service.parse(
      'if_here what message = junk',
      'none',
      [],
      0
    );

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    const action = actions[0] as HereAction;

    expect(action).toBeInstanceOf(HereAction);
    expect(action.obj).toBe('what');
    expect(action.actions.length).toBe(1);
  });

  it('not here', () => {
    const [actions, index] = service.parse(
      'if_nothere what message = junk',
      'none',
      [],
      0
    );

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    const action = actions[0] as NotHereAction;

    expect(action).toBeInstanceOf(NotHereAction);
    expect(action.obj).toBe('what');
    expect(action.actions.length).toBe(1);
  });

  it('invalid', () => {
    expect(() => service.parse('if_here', 'none', [], 0)).toThrowError(
      /unterminated/
    );

    expect(() => service.parse('if_nothere', 'none', [], 0)).toThrowError(
      /unterminated/
    );
  });
});

describe('ActionService drop something', () => {
  let service: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionService);
  });

  it('valid', () => {
    let [actions, index] = service.parse('!test', 'none', [], 0);

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    let action = actions[0] as DropAction;

    expect(action).toBeInstanceOf(DropAction);
    expect(action.what).toBe('test');
    expect(action.silent).toBeFalse();
    expect(action.self).toBeFalse();

    [actions, index] = service.parse('@!test', 'none', [], 0);

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as DropAction;

    expect(action).toBeInstanceOf(DropAction);
    expect(action.what).toBe('test');
    expect(action.silent).toBeTrue();
    expect(action.self).toBeFalse();

    [actions, index] = service.parse('#!test', 'none', [], 0);

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as DropAction;

    expect(action).toBeInstanceOf(DropAction);
    expect(action.what).toBe('test');
    expect(action.silent).toBeFalse();
    expect(action.self).toBeTrue();

    [actions, index] = service.parse('@#!test', 'none', [], 0);

    expect(index).toBe(0);
    expect(actions.length).toBe(1);

    action = actions[0] as DropAction;

    expect(action).toBeInstanceOf(DropAction);
    expect(action.what).toBe('test');
    expect(action.silent).toBeTrue();
    expect(action.self).toBeTrue();
  });

  it('invalid', () => {
    expect(() => service.parse('!', 'none', [], 0)).toThrowError(
      /unterminated/
    );
  });
});
