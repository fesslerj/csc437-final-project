import { combineReducers } from 'redux';

import Prss from './Prss';
import Cnvs from './Cnvs';
import Errs from './Errs';
import Msgs from './Msgs';

const rootReducer = combineReducers({Prss, Cnvs, Msgs, Errs});

export default rootReducer;


