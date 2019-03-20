import { combineReducers } from 'redux';

import Prss from './Prss';
import Rsts from './Rsts';
import Errs from './Errs';
import Revs from './Revs';
import Vots from './Vots';

const rootReducer = combineReducers({Prss, Rsts, Revs, Errs, Vots});

export default rootReducer;


