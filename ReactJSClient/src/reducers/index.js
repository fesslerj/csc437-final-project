import { combineReducers } from 'redux';

import Prss from './Prss';
import Rsts from './Rsts';
import Errs from './Errs';
import Revs from './Revs';

const rootReducer = combineReducers({Prss, Rsts, Revs, Errs});

export default rootReducer;


